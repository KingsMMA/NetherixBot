import type {AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class LogsCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'logs',
            description: 'View a user\'s moderation logs.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.ModerateMembers.toString(),
            options: [
                {
                    name: 'user',
                    description: 'The user you want to view the logs for.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user', true);
        const userData = await this.client.main.mongo.getUserData(interaction.guildId!, user.id);
        if (userData.cases.length === 0) return interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle(`Moderation Logs for ${user.tag}`)
                    .setColor('Blurple')
                    .setDescription('This user has no moderation logs.')
            ]
        });

        return interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle(`Moderation Logs for ${user.tag}`)
                    .setColor('Blurple')
                    .setDescription(userData.cases.map((c, i) => `**${i + 1}.** ${c.type} by ${c.moderator} at ${c.date.toDiscord('DD MMMM YYYY HH:MM')}.  Reason: ${c.reason}`).join('\n'))
            ]
        });
    }

}