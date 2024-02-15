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

        const query = new Portfolio({
            userId: interaction.user.id,
            guildId: interaction.guildId
        });
        const num = await Portfolio.deleteMany({
            userId: query.userId,
            guildId: query.guildId
        });

        interaction.editReply(`${num.deletedCount} portfolio(s) deleted`);
    }
}