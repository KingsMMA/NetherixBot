import type {AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';
import {Snowflake} from "discord-api-types/globals";

export default class KickCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'kick',
            description: 'Kicks a user from the server.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.KickMembers.toString(),
            options: [
                {
                    name: 'user',
                    description: 'The user you want to kick.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for kicking the user.',
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

        if (!member.kickable)
            return interaction.replyError('I cannot kick this user.');

        const reason = interaction.options.getString('reason') ?? 'No reason provided.';

        await member.send({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('You have been kicked.')
                    .setColor('Red')
                    .setDescription(`You have been kicked from ${interaction.guild!.name}.`)
                    .addField('Reason', reason)
            ]
        }).catch(() => {});

        await member.kick(reason);

        let userData = await this.client.main.mongo.getUserData(interaction.guildId!, user.id);
        userData.cases.push({
            user: user.id,
            type: 'Kicked',
            reason: reason,
            moderator: interaction.user.tag,
            date: new Date(),
        });
        await this.client.main.mongo.saveUserData(userData);

        return interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('User Kicked')
                    .setColor('Red')
                    .setDescription(`${user.tag} has been kicked from the server.`)
                    .addField('Reason', reason)
            ]
        });
    }

}