import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

import type { WeatherData } from '../../../main/util/types';
import type NetherixBot from '../../netherixBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class WeatherCommand extends BaseCommand {
    constructor(client: NetherixBot) {
        super(client, {
            name: 'weather',
            description: 'Check the weather in a specific location.',
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: 'city',
                    description: 'The city you want to check the weather for.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true,
                },
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const city = this.client.cities.find(city => city.id === interaction.options.getString('city'));
        if (!city) return interaction.replyError('City not found.');

        const weather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,rain`)
            .then(res => res.json()) as WeatherData;

        const embed = new KingsDevEmbedBuilder()
            .setTitle(`Weather in ${city.name}`)
            .setDescription('Here is the current weather in the specified location.')
            .setColor('Aqua')
            .addField('Temperature', `${weather.current.temperature_2m}°C`, true)
            .addField('Feels Like', `${weather.current.apparent_temperature}°C`, true)
            .addField('Rain', `${weather.current.rain}mm`, true);

        return interaction.reply({ embeds: [
            embed
        ] });
    }

    async autocomplete(interaction: AutocompleteInteraction) {
        return interaction.respond(
            this.client.cities
                .filter(city => city.name.toLowerCase()
                    .includes(interaction.options.getString('city')!.toLowerCase()))
                .slice(0, 20)
                .map(city => ({
                    name: city.name,
                    value: city.id,
                }))
        );
    }

}
