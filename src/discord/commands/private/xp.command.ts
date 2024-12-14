import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type { RolesObject } from '../../../main/util/types';
import type NetherixBot from '../../netherixBot';
import BaseCommand from '../base.command';

export default class XpCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'xp',
            description: 'Modify a user\'s XP.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.Administrator.toString(),
            options: [
                {
                    name: 'add',
                    description: 'Add XP to a user.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to add XP to.',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: 'amount',
                            description: 'The amount of XP to add.',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                        }
                    ]
                },
                {
                    name: 'remove',
                    description: 'Remove XP from a user.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to remove XP from.',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: 'amount',
                            description: 'The amount of XP to remove.',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                        }
                    ]
                },
                {
                    name: 'set',
                    description: 'Set a user\'s XP.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            description: 'The user to set XP for.',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: 'amount',
                            description: 'The amount of XP to set.',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                        }
                    ]
                }
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        switch (interaction.options.getSubcommand()) {
            case 'add':
                return this.addXp(interaction);
            case 'remove':
                return this.removeXp(interaction);
            case 'set':
                return this.setXp(interaction);
            default:
                return interaction.replyError('Invalid subcommand.');
        }
    }

    async addXp(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        const oldXp = this.client.levels.getXp(interaction.guildId!, user.id);
        this.client.levels.setXp(interaction.guildId!, user.id, oldXp + amount);
        await interaction.replySuccess(`Successfully added ${amount} XP to ${user.tag}.\nThey now have ${oldXp + amount} XP.`);

        void this.updateRoles(interaction);
    }

    async removeXp(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        const oldXp = this.client.levels.getXp(interaction.guildId!, user.id);
        this.client.levels.setXp(interaction.guildId!, user.id, oldXp - amount);
        await interaction.replySuccess(`Successfully removed ${amount} XP from ${user.tag}.\nThey now have ${oldXp - amount} XP.`);

        void this.updateRoles(interaction);
    }

    async setXp(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        this.client.levels.setXp(interaction.guildId!, user.id, amount);
        await interaction.replySuccess(`Successfully set ${user.tag}'s XP to ${amount}.`);

        void this.updateRoles(interaction);
    }

    async updateRoles(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const member = await interaction.guild!.members.fetch(user.id)
            .catch(() => null);
        if (!member) return interaction.editReply('Unable to fetch member to update roles.');

        const level = this.client.levels.getLevelFromXP(this.client.levels.getXp(interaction.guildId!, user.id));
        await this.client.levels.updateRoles(await this.client.main.mongo.getServerConfig(interaction.guildId!), member, level as keyof RolesObject);
    }

}
