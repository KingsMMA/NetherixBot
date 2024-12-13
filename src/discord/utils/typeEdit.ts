import chalk from 'chalk';
import type { InteractionResponse, Message } from 'discord.js';
import { ButtonInteraction } from 'discord.js';
import { CommandInteraction } from 'discord.js';

import KingsDevEmbedBuilder from './kingsDevEmbedBuilder';

const loggerInitialisedMessage = 'Logger initialised';

declare module 'discord.js' {
    interface CommandInteraction {
        replySuccess(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyError(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
    }
    interface ButtonInteraction {
        replySuccess(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyError(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
    }
}

declare global {
    interface Date {
        /**
         * Converts a date to a discord timestamp.
         */
        toDiscord(format: 'relative' | 'HH:MM' | 'HH:MM:SS' | 'DD/MM/YYYY' | 'DD MMMM YYYY' | 'DD MMMM YYYY HH:MM' | 'dddd, DD MMMM YYYY HH:MM'): string;
    }

}

CommandInteraction.prototype.replySuccess = ButtonInteraction.prototype.replySuccess = async function (message: string, ephemeral?: boolean) {
    if (this.replied || !this.isRepliable() || this.deferred)
        return this.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Green')
                    .setTitle('Success')
                    .setDescription(message)
            ],
        });
    else
        return this.reply({
            ephemeral: ephemeral,
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Green')
                    .setTitle('Success')
                    .setDescription(message)
            ],
        });
};

CommandInteraction.prototype.replyError = ButtonInteraction.prototype.replyError = async function (message: string, ephemeral?: boolean) {
    if (this.replied || !this.isRepliable() || this.deferred)
        return this.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Red')
                    .setTitle('Error')
                    .setDescription(message)
            ],
        });
    else
        return this.reply({
            ephemeral: ephemeral,
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Red')
                    .setTitle('Error')
                    .setDescription(message)
            ],
        });
};

Date.prototype.toDiscord = function (format) {
    switch (format) {
        case 'relative':
            return `<t:${Math.floor(this.valueOf() / 1000)}:R>`;
        case 'HH:MM':
            return `<t:${Math.floor(this.valueOf() / 1000)}:t>`;
        case 'HH:MM:SS':
            return `<t:${Math.floor(this.valueOf() / 1000)}:T>`;
        case 'DD/MM/YYYY':
            return `<t:${Math.floor(this.valueOf() / 1000)}:d>`;
        case 'DD MMMM YYYY':
            return `<t:${Math.floor(this.valueOf() / 1000)}:D>`;
        case 'DD MMMM YYYY HH:MM':
            return `<t:${Math.floor(this.valueOf() / 1000)}:f>`;
        case 'dddd, DD MMMM YYYY HH:MM':
            return `<t:${Math.floor(this.valueOf() / 1000)}:F>`;
    }
};

const real = {
    log: console.log,
    error: console.error,
};

console.log = (message?: any, ...optionalParams: any[]) => {
    const params = [
        message
    ];
    if (optionalParams.length) {
        params.push(...optionalParams);
    }
    for (let i = 0; i < params.length; i++) {
        if (typeof params[i] === 'string') {
            params[i] = chalk.blue(params[i]);
        }
    }
    real.log(chalk.red(`[${time()}] >`), ' ', ...params);
};

console.info = (message?: any, ...optionalParams: any[]) => {
    const params = [
        message
    ];
    if (optionalParams.length) {
        params.push(...optionalParams);
    }
    for (let i = 0; i < params.length; i++) {
        if (typeof params[i] === 'string') {
            params[i] = chalk.cyan(params[i]);
        }
    }
    real.log(chalk.red(`[${time()}] >`), ' ', ...params);
};

console.debug = (message?: any, ...optionalParams: any[]) => {
    const params = [
        message
    ];
    if (optionalParams.length) {
        params.push(...optionalParams);
    }
    real.log(chalk.red(`[${time()}] >`), ' ', chalk.blueBright(...params));
};

console.error = (e: Error) => {
    real.error(chalk.bgRedBright.white(`[${time()}] ERROR >`), ' ', chalk.red(e), chalk.red(e.stack));
};

function time() {
    return new Date()
        .toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
}

export default loggerInitialisedMessage;
