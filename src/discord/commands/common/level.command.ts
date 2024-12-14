import type { ChatInputCommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class LevelCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'level',
            description: 'View a user\'s level.',
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to view the level of.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);

        const xp = this.client.levels.getXp(interaction.guildId!, user.id);
        await interaction.reply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle(`${user.tag}'s Level`)
                    .setColor('Blue')
                    .setDescription(this.client.levels.getLevelProgressStringWithLevel(xp))
            ]
        });
    }

}
