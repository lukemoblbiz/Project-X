const { Client, GatewayIntentBits, ApplicationCommandOptionType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const axios = require('axios');
const eventHandler = require('./handlers/eventHandler.js');
const mongoose = require('mongoose');
const Moralis = require("moralis").default;

require('dotenv').config();

const token = process.env['TOKEN'];

async function mor() {
  await Moralis.start({
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjFlYmRiNTg3LTQ2ZjMtNGVjMy1iMzVjLTBmZTk3MzMyYmM0YyIsIm9yZ0lkIjoiMzc3NDIxIiwidXNlcklkIjoiMzg3ODUyIiwidHlwZUlkIjoiZjBkMzMxMDEtNGY3MS00NGMwLTkwNTYtYzM1MzIzNzZmZDJhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDgwMjI0MDAsImV4cCI6NDg2Mzc4MjQwMH0.58ucItw_dPvfXiRd-P-8f_sSwXBRH9GSfBIlmjsSA7s"
  });
}
mor()

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
