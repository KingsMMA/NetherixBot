import type {AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType, ChannelType} from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';
import {RolesObject} from "../../../main/util/types";

export default class LevelConfigCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'level-config',
            description: 'Configure the level system.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.Administrator.toString(),
            options: [
                {
                    name: 'view',
                    description: 'View the current level system configuration.',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'level-up-channel',
                    description: 'Set the channel where level up messages are sent.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'channel',
                            description: 'The channel where level up messages are sent.',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                            channel_types: [ChannelType.GuildText]
                        }
                    ]
                },
                {
                    name: 'roles',
                    description: 'Manage the roles that are given to users at certain levels.',
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    options: [
                        {
                            name: 'generate',
                            description: 'Generate the roles for the level system.',
                            type: ApplicationCommandOptionType.Subcommand,
                        },
                        {
                            name: 'set',
                            description: 'Set the role given to users at a certain level.',
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: 'level',
                                    description: 'The level to set the role for.',
                                    type: ApplicationCommandOptionType.Integer,
                                    required: true,
                                },
                                {
                                    name: 'role',
                                    description: 'The role to give to users at the specified level.',
                                    type: ApplicationCommandOptionType.Role,
                                    required: true,
                                }
                            ]
                        }
                    ]
                }
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        switch (interaction.options.getSubcommand()) {
            case 'view':
                return this.viewConfig(interaction);
            case 'level-up-channel':
                return this.setLevelUpChannel(interaction);
            case 'generate':
                return this.generateRoles(interaction);
            case 'set':
                return this.setRole(interaction);
            default:
                return interaction.replyError('Invalid subcommand.');
        }
    }

    async viewConfig(interaction: ChatInputCommandInteraction) {
        const config = await this.client.main.mongo.getServerConfig(interaction.guildId!);
        await interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('Level System Configuration')
                    .setColor('Blue')
                    .addField('Level Up Channel', config.levelUpChannel ? `<#${config.levelUpChannel}>` : 'No channel set.')
                    .addField('Roles', Object.entries(config.roles).map(([level, roleId]) => `Level ${level}: ${
                        roleId ? `<@&${roleId}>` : 'No role set.'
                    }`).join('\n'))
            ]
        });
    }

    async setLevelUpChannel(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel', true);
        const config = await this.client.main.mongo.getServerConfig(interaction.guildId!);
        config.levelUpChannel = channel.id;
        await this.client.main.mongo.saveServerConfig(config);
        await interaction.replySuccess(`Set the level up channel to <#${channel.id}>.\nLevel up messages will be sent here.`);
    }

    async generateRoles(interaction: ChatInputCommandInteraction) {
        await interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('Loading...')
                    .setColor('Yellow')
                    .setDescription('Generating the roles for the level system...')
            ]
        });

        const config = await this.client.main.mongo.getServerConfig(interaction.guildId!);

        for (let i = 10; i >= 1; i--) {
            await interaction.guild!.roles.create({
                name: `Level ${
                    ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][i - 1]
                }`,
                color: 'Blue',
                permissions: [],
                mentionable: false,
            }).then(role => {
                config.roles[i as keyof RolesObject] = role.id;
            });
        }

        await this.client.main.mongo.saveServerConfig(config);
        await interaction.replySuccess('Generated the roles for the level system.\nUsers at each level will receive the corresponding role when they next send a message.');
    }

    async setRole(interaction: ChatInputCommandInteraction) {
        const level = interaction.options.getInteger('level', true);
        const role = interaction.options.getRole('role', true);

        if (level < 1 || level > 10)
            return interaction.replyError('Level must be between 1 and 10.');

        const config = await this.client.main.mongo.getServerConfig(interaction.guildId!);
        config.roles[level as keyof RolesObject] = role.id;
        await this.client.main.mongo.saveServerConfig(config);
        await interaction.replySuccess(`Set the role for level ${level} to <@&${role.id}>.\nUsers at this level will receive the role when they next send a message.`);
    }

}