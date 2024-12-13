import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionsBitField } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class UnbanCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'unban',
            description: 'Unbans a user from the server.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.BanMembers.toString(),
            options: [
                {
                    name: 'user',
                    description: 'The user you want to unban.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for unbanning the user.',
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

        await interaction.guild!.bans.remove(user.id, reason)
            .catch(() => interaction.replyError('User not found.'))
            .then(async () => {
                await user.send({
                    embeds: [
                        new KingsDevEmbedBuilder()
                            .setTitle('You have been unbanned.')
                            .setColor('Green')
                            .setDescription(`You have been unbanned from ${interaction.guild!.name}.`)
                            .addField('Reason', reason)
                    ]
                })
                    .catch(() => {});

                const userData = await this.client.main.mongo.getUserData(interaction.guildId!, user.id);
                userData.cases.push({
                    user: user.id,
                    type: 'Unbanned',
                    reason: reason,
                    moderator: interaction.user.tag,
                    date: new Date(),
                });
                await this.client.main.mongo.saveUserData(userData);

                return interaction.editReply({
                    embeds: [
                        new KingsDevEmbedBuilder()
                            .setTitle('User Unbanned')
                            .setColor('Green')
                            .setDescription(`${user.tag} has been unbanned from the server.`)
                            .addField('Reason', reason)
                    ]
                });
            });
    }

}
