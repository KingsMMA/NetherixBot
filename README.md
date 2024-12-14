# Netherix Bot
###### A commission developed by KingsDev

![Screenshot of a user checking their level, followed by them sending a message and levelling up](https://github.com/user-attachments/assets/176df15a-eb2f-4fd6-992c-49820dfea4b0)
###### To see more of my work, including more screenshots, go to https://kingrabbit.dev/

NetherixBot is a discord bot developed for the Netherix Studios trial task.  It contains the following features:
- **Moderation:** Allows server moderators to take action against problematic users, such as by deleting messages and punishing users.  All punishments are logged and can be accessed via the `/logs` command.  The following punishment types exist: warn, kick, mute, and ban.
- **Levelling:** Allows users to level up and earn rewards as they interact with the server.  Users will earn XP when they interact with chats, which will award them additional rewards and permissions via the assignment of level roles.  The bot allows server admins to either provide their own level roles or to auto-generate a set of level roles.  These roles can then be assigned additional permissions or given extra rewards (i.e. via giveaways, see [here](https://github.com/KingsMMA/GiveawayBot)).
- **Weather Checker:** Integrates with an external weather API to provide real-time weather data to users.  The bot also integrates with an external city API to allow autocompletion and searching for any city in the world to check the weather for.

All commands work per-guild; that is, punishments and moderation logs, levelling configs and user XPs, etc. are all per-guild.  Each instance of the bot can work in as many servers as the hardware can handle.

## Commands
`<>` required parameter  
`[]` optional parameter

---
### Moderation
All of these commands require staff permissions corresponding to the command, although additional overrides can be set through the server settings.

#### `/logs <user>`
View a user's moderation logs.

#### `/purge`
Purge messages in a channel.  One of the following subcommands must be used:
- #### `/purge messages <amount>`
  Delete the last X messages in the current channel.
- #### `/purge user <user> <amount>`
  Delete the last X messages sent by the specified user in the current channel.

#### `/warn <user> [reason]`
Warns a user, optionally specifying a reason.  The user will be DMed and the warn will be added to their moderation logs.

#### `/kick <user> [reason]`
Kicks a user from the server, optionally specifying a reason.  The user will be DMed before being kicked and the kick will be added to their moderation logs.

#### `/mute <user> <duration> [reason]`
Mutes a user, temporarily preventing them from talking, joining VCs, or interacting with bots in the server.  A reason may optionally be specified; the duration should be in the format `1d 2h 3m 4s` with a max duration of 28 days due to Discord API specifications.  The user will be DMed and the mute will be added to their moderation logs. 

#### `/unmute <user> [reason]`
Unmutes a user (AKA removes any current mutes), optionally specifying a reason.  The user will be DMed to notify them that their mute has been removed and the reason for the mute being removed will be logged in the user's moderation logs.

#### `/ban <user> [reason]`
Bans a user from the server, preventing them (or any other account on the same IP address) from rejoining the server, and optionally specifying a reason.  The user will be DMed and the ban will be added to their moderation logs. 

#### `/unban <user> [reason]`
Unbans a user from the server, optionally specifying a reason.  The bot will attempt to DM the user to notify them that their ban has been removed and that they may rejoin the server.  The reason for the ban being removed will be logged in the user's moderation logs.

---
### Levelling
All of these commands except for `/level` require staff permissions corresponding to the command, although additional overrides can be set through the server settings.

#### `/level <user>`
View a user's level and their progress towards the next level.

#### `/xp`
Manages a user's experience points.  One of the following subcommands must be used:
- #### `/xp add <user> <amount>`
  Gives a user additional XP.
- #### `/xp remove <user> <amount>`
  Takes XP away from a user.
- #### `/xp set <user> <amount>`
  Sets a user to a specified amount of XP.

#### `/level-config`
Sets up a server's levelling system.  Users will still gain XP before this is set up, although they won't receive any level roles.  One of the following subcommands must be used:
- #### `/level-config view`
  Views the server's current level system configuration, including the level-up channel and the level roles.
- #### `/level-config level-up-channel`
  Updates the server's level-up channel.  This is the channel where user level-ups are announced - when a user levels up, the message that got them the final bit of XP will be replied to with a level-up message as well.  As such, server admins can opt not to specify a level-up channel in order to have level-up notifications kept to the channel in which the user levelled up in.
- #### `/level-config roles set <level> <role>`
  Sets the role to give users when they reach a specified level.
- #### `/level-config roles generate`
  Generates level roles and automatically adds them to the config.

---
### Weather Checker
None of these commands require any additional permissions, although overrides can be set through the server settings.

#### `/weather <city>`
Checks the current weather data in the specified city.  Users should search for the city they wish to check and use autocompletion to provide the bot with the accurate city name.

## Running the bot
The bot is built using Node.js 20.  To run the bot, install the required dependencies with `npm i` and then run the bot with `npm run start`.  
The bot requires environment variables to be set (optionally through the creation of a `.env` file):
- `BOT_ID` - The bot's user ID
- `BOT_TOKEN` - The bot token
- `MONGO_URI` - The MongoDB URI the bot should connect to.  This database will be used to store the reaction roles.
