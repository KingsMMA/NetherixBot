import type { Snowflake } from 'discord-api-types/globals';
import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type Main from '../main';
import type { RolesObject, ServerConfig, UserData } from './types';

export default class Mongo {
    private mongo!: Db;
    main: Main;
    constructor(main: Main) {
        this.main = main;
    }

    async connect() {
        const client = await MongoClient.connect(process.env.MONGO_URI!);
        this.mongo = client.db(this.main.config.mongo.database);
        console.info(`Connected to Database ${this.mongo.databaseName}`);

        await this.main.client.levels.loadLevelData();
    }

    async getUserData(guildId: Snowflake, userId: Snowflake): Promise<UserData> {
        return await this.mongo
            .collection('users')
            .findOne({ guildId, userId }) as UserData | null ?? { guildId, userId, cases: [] };
    }

    async saveUserData(data: UserData) {
        await this.mongo
            .collection('users')
            .updateOne({ guildId: data.guildId, userId: data.userId }, { $set: data }, { upsert: true });
    }

    async loadLevelData(): Promise<Record<Snowflake, Record<Snowflake, number>>> {
        return Object.fromEntries(
            (await this.mongo
                .collection('levels')
                .find()
                .toArray())
                .map(({ guildId, users }) => [
                    guildId, users
                ]));
    }

    async saveLevelData(data: Record<Snowflake, Record<Snowflake, number>>) {
        await Promise.all(
            Object.entries(data)
                .map(([
                    guildId, users
                ]) => this.mongo
                    .collection('levels')
                    .updateOne({ guildId }, { $set: { users } }, { upsert: true })));
    }

    async getServerConfig(guildId: Snowflake): Promise<ServerConfig> {
        return await this.mongo
            .collection('config')
            .findOne({ guildId }) as ServerConfig | null ?? {
            guildId,
            levelUpChannel: null,
            roles: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [
                i + 1, null
            ])) as unknown as RolesObject,
        };
    }

    async saveServerConfig(config: ServerConfig) {
        await this.mongo
            .collection('config')
            .updateOne({ guildId: config.guildId }, { $set: config }, { upsert: true });
    }

}
