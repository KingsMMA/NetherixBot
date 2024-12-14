import type { ClientOptions } from 'discord.js';
import { Client, Collection } from 'discord.js';
import type { PathLike } from 'fs';
import fs from 'fs';
import path from 'path';

import type Main from '../main/main';
import type { City } from '../main/util/types';
import type BaseCommand from './commands/base.command';
import LevelManager from './levels';

export default class NetherixBot extends Client {

    main: Main;
    levels: LevelManager;
    commands: Collection<string, BaseCommand> = new Collection();
    cities: City[];

    constructor(main: Main, options: ClientOptions) {
        super(options);
        this.main = main;
        this.levels = new LevelManager(this);

        console.log('Loading cities...');
        if (fs.existsSync('./cache/cities.json')) {
            console.log('Cities cache found, loading...');
            this.cities = JSON.parse(fs.readFileSync('./cache/cities.json', 'utf-8'));
            console.log(`Loaded ${this.cities.length} cities.`);
        } else {
            this.cities = [];
            console.log('Cities cache not found, fetching from API...');
            fetch('https://raw.githubusercontent.com/lmfmaier/cities-json/refs/heads/master/cities500.json')
                .then(res => res.json())
                .then((data: any) => {
                    this.cities = data.map((city: any) => ({
                        id: city.id,
                        name: `${city.name}, ${city.admin1} ${city.country}`,
                        latitude: Number.parseFloat(city.lat),
                        longitude: Number.parseFloat(city.lon),
                    }));
                    fs.mkdirSync('./cache', { recursive: true });
                    fs.writeFileSync('./cache/cities.json', JSON.stringify(this.cities, null, 4));
                    console.log(`Loaded ${this.cities.length} cities.`);
                });
        }
    }

    loadCommand(commandPath: PathLike, commandName: string) {
        try {
            const command: BaseCommand = new (require(`${commandPath}${path.sep}${commandName}`).default)(this);
            console.info(`Loading Command: ${command.name}.`);
            this.commands.set(command.name, command);
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }

    loadEvent(eventPath: PathLike, eventName: string) {
        try {
            const event = new (require(`${eventPath}${path.sep}${eventName}`).default)(this);
            console.info(`Loading Event: ${eventName}.`);
            this.on(eventName, (...args) => event.run(...args));
        } catch (e) {
            return `Unable to load event ${eventName}: ${e}`;
        }
    }
}
