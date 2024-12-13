import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class UnmuteCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'unmute',
            description: 'Unmutes a user in the server.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.ModerateMembers.toString(),
            options: [
                {
                    name: 'user',
                    description: 'The user you want to unmute.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for unmuting the user.',
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

        if (!member.moderatable)
            return interaction.replyError('I cannot unmute this user.');
        if (!member.communicationDisabledUntilTimestamp)
            return interaction.replyError('This user is not muted.');

        const reason = interaction.options.getString('reason') ?? 'No reason provided.';
        await member.timeout(null, reason);

        await member.send({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('You have been unmuted.')
                    .setColor('Green')
                    .setDescription(`You have been unmuted in ${interaction.guild!.name}.`)
                    .addField('Reason', reason)
            ]
        })
            .catch(() => {});

        const userData = await this.client.main.mongo.getUserData(interaction.guildId!, user.id);
        userData.cases.push({
            user: user.id,
            type: 'Unmuted',
            reason: reason,
            moderator: interaction.user.tag,
            date: new Date(),
        });
        await this.client.main.mongo.saveUserData(userData);

        return interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('User Unmuted')
                    .setColor('Green')
                    .setDescription(`${user.tag} has been unmuted in the server.`)
                    .addField('Reason', reason)
            ]
        });
    }

}
