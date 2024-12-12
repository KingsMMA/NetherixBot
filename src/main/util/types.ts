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
