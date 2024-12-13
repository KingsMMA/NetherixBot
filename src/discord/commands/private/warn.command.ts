import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class WarnCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'warn',
            description: 'Warns a user in the server.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.ModerateMembers.toString(),
            options: [
                {
                    name: 'user',
                    description: 'The user you want to warn.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for warning the user.',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                }
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') ?? 'No reason provided.';

        await user.send({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('You have been warned.')
                    .setColor('Red')
                    .setDescription(`You have been warned in ${interaction.guild!.name}.`)
                    .addField('Reason', reason)
            ]
        })
            .catch(() => {});

        const userData = await this.client.main.mongo.getUserData(interaction.guildId!, user.id);
        userData.cases.push({
            user: user.id,
            type: 'Warned',
            reason: reason,
            moderator: interaction.user.tag,
            date: new Date(),
        });
        await this.client.main.mongo.saveUserData(userData);

        return interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('User Warned')
                    .setColor('Red')
                    .setDescription(`${user.tag} has been warned.`)
                    .addField('Reason', reason)
            ]
        });
    }

}
