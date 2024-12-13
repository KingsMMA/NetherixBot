import {Snowflake} from "discord-api-types/globals";

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
    type: 'Warned' | 'Muted' | 'Kicked' | 'Banned';
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
