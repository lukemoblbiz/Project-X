const { Client, Events, GatewayIntentBits, MessageEmbed, ApplicationCommandOptionType } = require('discord.js');
const newCollection = require('./newCollection.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const statsCollectionModule = require('./statsCollection.js');

require('dotenv').config();

const token = `${process.env[`TOKEN`]}`;

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
] });

client.on("ready", () => {
    console.log(`Logged is as ${client.user.tag}!`);
});

const commands = [
    {
        name: 'nftstats',
        description: 'Returns stats of a Magic Eden collection',
        options: [
            {
                name: 'symbol',
                description: 'Enter the symbol of the collection',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ] 
    },
];

const rest = new REST({ version: '10' }).setToken(process.env['TOKEN']);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env['CLIENT_ID'], process.env['GUILD_ID']),
            {body: commands}
        )

        console.log('Slash commands were registered successfully');
    } catch (error) {
        console.log(`There was an error ${error}`)
    }
})();

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName === 'nftstats') {
            const theSymbol = interaction.options.get('symbol');
            return theSymbol;
        }
    }
);

if (!token || typeof token !== 'string') {
    throw new Error('Invalid token configuration.');
  }

newCollection.init(client);

client.login(token)
  .catch(error => {
    console.error(`Error during login: ${error.message}`);
  });