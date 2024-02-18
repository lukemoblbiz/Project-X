const { Client, GatewayIntentBits, ApplicationCommandOptionType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const axios = require('axios');
const eventHandler = require('./handlers/eventHandler.js');
const mongoose = require('mongoose');
const Moralis = require("moralis").default;

require('dotenv').config();

const token = process.env['TOKEN'];
const apiKey = process.env['APIKEY']

async function mor() {
  await Moralis.start({
    apiKey: apiKey
  });
}
mor();

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
] });

if (!token || typeof token !== 'string') {
    throw new Error('Invalid token configuration.');
}

(async () => {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to DB.');

      eventHandler(client);
      
      client.login(token)
        .catch(error => {
          console.error(`Error during login: ${error.message}`);
        });
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  })();
