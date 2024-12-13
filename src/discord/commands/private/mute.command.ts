import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class MuteCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'mute',
            description: 'Mutes a user in the server.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.ModerateMembers.toString(),
            options: [
                {
                    name: 'user',
                    description: 'The user you want to mute.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'duration',
                    description: 'How long to mute the user for. (1d 2h 3m 4s format)',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for muting the user.',
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
            return interaction.replyError('I cannot mute this user.');
        if (member.communicationDisabledUntilTimestamp)
            return interaction.replyError('This user is already muted.');

        const reason = interaction.options.getString('reason') ?? 'No reason provided.';
        let duration = interaction.options.getString('duration', true)
            .parseDuration();
        if (duration <= 0)
            return interaction.replyError('Invalid duration.');
        else if (duration === 28 * 24 * 60 * 60 * 1000)
            duration = (28 * 24 * 60 * 60 * 1000) - 1000;
        else if (duration > 28 * 24 * 60 * 60 * 1000)
            return interaction.replyError('The duration cannot be longer than 28 days.');

        await member.send({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('You have been muted.')
                    .setColor('Red')
                    .setDescription(`You have been muted in ${interaction.guild!.name} for ${duration.formatTime()}.`)
                    .addField('Reason', reason)
                    .addField('Expires', new Date(Date.now() + duration)
                        .toDiscord('relative'))
            ]
        })
            .catch(() => {});

        await member.timeout(duration, reason);

        const userData = await this.client.main.mongo.getUserData(interaction.guildId!, user.id);
        userData.cases.push({
            user: user.id,
            type: 'Muted',
            reason: reason,
            moderator: interaction.user.tag,
            date: new Date(),
            duration: duration,
        });
        await this.client.main.mongo.saveUserData(userData);

        return interaction.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('User Muted')
                    .setColor('Red')
                    .setDescription(`${user.tag} has been muted in the server for ${duration.formatTime()}.`)
                    .addField('Reason', reason)
                    .addField('Expires', new Date(Date.now() + duration)
                        .toDiscord('relative'))
            ]
        });
    }

}
