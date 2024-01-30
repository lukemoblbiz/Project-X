const { Client, Events, GatewayIntentBits, MessageEmbed } = require('discord.js');
const newCollection = require('./newCollection.js');
require("dotenv").config();
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
] });
const mySecret = process.env['TOKEN'];

client.on("ready", () => {
    console.log(`Logged is as ${client.user.tag}!`);
});

newCollection.init(client);

client.login(mySecret);