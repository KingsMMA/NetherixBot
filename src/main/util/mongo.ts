import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type Main from '../main';
import {Snowflake} from "discord-api-types/globals";
import {UserData} from "./types";

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
    }

    async getUserData(guildId: Snowflake, userId: Snowflake): Promise<UserData> {
        return await this.mongo
            .collection('users')
            .findOne({ guildId, userId }) as UserData | null ?? { guildId, userId, cases: [] };
    }

    async saveUserData(data: UserData) {
        await this.mongo
            .collection('users')
            .updateOne({guildId: data.guildId, userId: data.userId}, {$set: data}, {upsert: true});
    }

}
