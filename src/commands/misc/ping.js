module.exports = {
    name: 'ping',
    description: 'pong',
    devOnly: true,
    testOnly: true,

    callback: (client, interaction) => {
        interaction.reply(`Pong! ${client.ws.ping}ms`);
    }
}