import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class BanCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'ban',
            description: 'Bans a user from the server.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.BanMembers.toString(),
            options: [
                {
                    name: 'user',
                    description: 'The user you want to ban.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for banning the user.',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                }
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user', true);
        const member = await interaction.guild!.members.fetch(user.id)
            .catch(() => null);
        if (!member)
            return interaction.replyError('User not found.');

        if (!member.bannable)
            return interaction.replyError('I cannot ban this user.');

        const reason = interaction.options.getString('reason') ?? 'No reason provided.';

        await member.send({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('You have been banned.')
                    .setColor('Red')
                    .setDescription(`You have been banned from ${interaction.guild!.name}.`)
                    .addField('Reason', reason)
            ]
        })
            .catch(() => {});

        await member.ban({ reason });

        const userData = await this.client.main.mongo.getUserData(interaction.guildId!, user.id);
        userData.cases.push({
            user: user.id,
            type: 'Banned',
            reason: reason,
            moderator: interaction.user.tag,
            date: new Date(),
        });
        await this.client.main.mongo.saveUserData(userData);

        return interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('User Banned')
                    .setColor('Red')
                    .setDescription(`${user.tag} has been banned from the server.`)
                    .addField('Reason', reason)
            ]
        });
    }

}
