const { Client, Events, GatewayIntentBits, MessageEmbed } = require('discord.js');
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

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName === 'stats') {
            
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