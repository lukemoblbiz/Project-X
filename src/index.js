const { Client, Events, GatewayIntentBits } = require('discord.js');
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

client.on('messageCreate', (message) => {
    console.log(message.content);
})

client.login(mySecret);