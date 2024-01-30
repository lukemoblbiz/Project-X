const { REST, ROUTES, Routes, ApplicationCommandOptionType } = require('discord.js')
require("dotenv").config();

const commands = [
    {
        name: 'stats',
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