import type NetherixBot from '../netherixBot';

export default class {
    client: NetherixBot;

    constructor(client: NetherixBot) {
        this.client = client;
    }

    run() {
        console.info(`Successfully logged in! \nSession Details: id=${this.client.user?.id} tag=${this.client.user?.tag}`);
    }
}
