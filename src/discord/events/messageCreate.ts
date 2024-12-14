import {GuildTextBasedChannel, Message} from "discord.js";
import NetherixBot from "../netherixBot";
import {RolesObject} from "../../main/util/types";

export default class {

    client: NetherixBot;

    constructor(client: NetherixBot) {
        this.client = client;
    }

    async run(message: Message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        let levelledUp = this.client.levels.setXp(
            message.guild!.id,
            message.author.id,
            this.client.levels.getXp(message.guild!.id, message.author.id) + Math.floor(Math.random() * 3) + 3,
        );

        let config = await this.client.main.mongo.getServerConfig(message.guild.id);
        let level = this.client.levels.getLevelFromXP(this.client.levels.getXp(message.guild!.id, message.author.id));
        if (levelledUp) {
            await message.reply(`:tada: You levelled up to level ${level}!`);
            if (config.levelUpChannel) {
                let channel = await message.guild.channels.fetch(config.levelUpChannel)
                    .catch(() => null);
                if (channel)
                    await (channel as GuildTextBasedChannel).send(`:tada: ${message.author.toString()} levelled up to level ${level}!`);
            }
        }

        await this.client.levels.updateRoles(config, message.member!, level as keyof RolesObject);
    }

}