import NetherixBot from "./netherixBot";
import {Snowflake} from "discord-api-types/globals";
import {main} from "../main/main";
import {RolesObject, ServerConfig} from "../main/util/types";
import {GuildMember} from "discord.js";

export default class LevelManager {

    client: NetherixBot;
    xpCache: Record<Snowflake, Record<Snowflake, number>> = {};

    constructor(client: NetherixBot) {
        this.client = client;
    }

    async loadLevelData() {
        console.log('Loading level data from config...');
        this.xpCache = await this.client.main.mongo.loadLevelData();
        setInterval(() => this.saveLevelData(), 1000 * 15);
        console.log('Loaded level data from config.');
    }

    async saveLevelData() {
        await main.mongo.saveLevelData(this.xpCache);
    }

    async updateRoles(serverConfig: ServerConfig, member: GuildMember, level: keyof RolesObject) {
        let role = serverConfig.roles[level];
        if (role && !member.roles.cache.has(role)) await member.roles.add(role);

        let rolesToRemove = Object.entries(serverConfig.roles)
            .filter(([l, _]) => l.toString() !== level.toString())
            .filter(([_, role]) => member.roles.cache.has(role));
        if (rolesToRemove.length > 0) await member.roles.remove(rolesToRemove.map(([_, role]) => role));
    }

    getXp(guildId: Snowflake, userId: Snowflake): number {
        return this.xpCache[guildId]?.[userId] ?? 0;
    }

    setXp(guildId: Snowflake, userId: Snowflake, xp: number): boolean {
        console.log(`Setting XP for ${userId} in ${guildId} to ${xp}`);
        if (!this.xpCache[guildId]) this.xpCache[guildId] = {};
        let oldXp = this.xpCache[guildId][userId] ?? 0;
        this.xpCache[guildId][userId] = xp;
        return this.getLevelFromXP(oldXp) !== this.getLevelFromXP(xp);
    }

    getLevelFromXP(xp: number) {
        return Math.min(
            Math.floor(0.1 * Math.sqrt(xp)),
            10
        );
    }

    getXPToLevel(level: number) {
        return Math.ceil(100 * Math.pow(
            Math.min(level, 10),
            2));
    }

    getLevelProgress(xp: number) {
        const level = this.getLevelFromXP(xp);
        const currentLevelXP = this.getXPToLevel(level);
        const nextLevelXP = this.getXPToLevel(level + 1);
        return (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
    }

    getLevelProgressString(xp: number) {
        const level = this.getLevelFromXP(xp);
        const currentLevelXP = this.getXPToLevel(level);
        const nextLevelXP = this.getXPToLevel(level + 1);
        return `${xp - currentLevelXP} / ${nextLevelXP - currentLevelXP}`;
    }

    getLevelProgressStringWithLevel(xp: number) {
        const level = this.getLevelFromXP(xp);
        const currentLevelXP = this.getXPToLevel(level);
        const nextLevelXP = this.getXPToLevel(level + 1);
        return `Level ${level} (${xp - currentLevelXP} / ${nextLevelXP - currentLevelXP})`;
    }
}