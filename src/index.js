const { Client, GatewayIntentBits, ApplicationCommandOptionType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const newCollection = require('./newCollection.js');
const statsCollectionModule = require('./statsCollection.js');
const axios = require('axios');
const eventHandler = require('./handlers/eventHandler.js');

require('dotenv').config();

const token = process.env['TOKEN'];

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
] });

if (!token || typeof token !== 'string') {
    throw new Error('Invalid token configuration.');
}

eventHandler(client);
newCollection.init(client);

client.login(token)
  .catch(error => {
    console.error(`Error during login: ${error.message}`);
  });