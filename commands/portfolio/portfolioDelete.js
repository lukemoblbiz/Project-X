const Portfolio = require("../../models/Portfolio");
const { Client, Interaction } = require('discord.js');

module.exports = {
    name: 'deleteportfolio',
    description: 'Check your portfolio`s networth.',
    devOnly: true,
    testOnly: true,

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {

        await interaction.deferReply({ ephemeral: true });

        const query = {
            userId: interaction.user.id,
            guildId: interaction.guildId
        };
        const num = await Portfolio.deleteMany(query);

        interaction.editReply(`${num.deletedCount} portfolio(s) deleted`);
    }
}