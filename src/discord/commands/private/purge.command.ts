import type {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    GuildBasedChannel,
    GuildTextBasedChannel
} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class PurgeCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'purge',
            description: 'Purge messages in a channel',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.ManageChannels.toString(),
            options: [
                {
                    name: 'messages',
                    description: 'Purge a set number of messages',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'amount',
                            description: 'The amount of messages to purge',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                        }
                    ]
                },
                {
                    name: 'user',
                    description: 'Purge a set number of messages from a user',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to purge messages from',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: 'amount',
                            description: 'The amount of messages to purge',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                        }
                    ]
                }
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        switch (interaction.options.getSubcommand()) {
            case 'messages':
                return this.purgeMessages(interaction);
            case 'user':
                return this.purgeUser(interaction);
            default:
                return interaction.replyError('Invalid subcommand.');
        }
    }

    async purgeMessages(interaction: ChatInputCommandInteraction) {
        const amount = interaction.options.getInteger('amount', true);
        if (amount < 1 || amount > 100)
            return interaction.replyError('Amount must be between 1 and 100.');

        await (interaction.channel as GuildTextBasedChannel).bulkDelete(amount, true)
            .then(() => interaction.editReply( `Successfully purged ${amount} messages.`))
            .catch(() => interaction.replyError('Failed to purge messages.'));
    }

    async purgeUser(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);
        if (amount < 1 || amount > 100)
            return interaction.replyError('Amount must be between 1 and 100.');

        await (interaction.channel as GuildTextBasedChannel).messages.fetch({ limit: 100 })
            .then(messages => {
                const userMessages = Array.from(messages.filter(m => m.author.id === user.id).values()).slice(0, amount);
                (interaction.channel as GuildTextBasedChannel).bulkDelete(userMessages, true)
                    .then(() => interaction.editReply(`Successfully purged ${amount} messages from ${user.toString()}.`))
                    .catch(() => interaction.replyError('Failed to purge messages.'));
            })
            .catch(() => interaction.replyError('Failed to fetch messages.'));
    }

}