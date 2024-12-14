import type { Snowflake } from 'discord-api-types/globals';

export interface City {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

export interface WeatherData {
    current: {
        temperature_2m: number;
        apparent_temperature: number;
        rain: number;
    };
}

export interface Case {
    user: Snowflake;
    type: 'Warned' | 'Muted' | 'Kicked' | 'Banned' | 'Unmuted' | 'Unbanned';
    reason: string;
    moderator: string;
    date: Date;
    duration?: number;
}

export interface UserData {
    guildId: Snowflake;
    userId: Snowflake;
    cases: Case[];
}

/**
 * This is so we can cast the `Object.fromEntries(Array.from({ length: 11 }, (_, i) => [i, null]));` to this type.
 */
export interface RolesObject {
    1: Snowflake | null;
    2: Snowflake | null;
    3: Snowflake | null;
    4: Snowflake | null;
    5: Snowflake | null;
    6: Snowflake | null;
    7: Snowflake | null;
    8: Snowflake | null;
    9: Snowflake | null;
    10: Snowflake | null;
}

export interface ServerConfig {
    guildId: Snowflake;
    levelUpChannel: Snowflake | null;
    roles: RolesObject;
}
