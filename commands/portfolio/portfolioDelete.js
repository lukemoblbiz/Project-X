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

        await interaction.deferReply();
        await Portfolio.deleteMany({userId: interaction.user.id, guildId: interaction.guildID});
        interaction.editReply(`Portfolio deleted`);
    }
}