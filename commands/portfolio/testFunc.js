const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');
const fetchCollectionStats = require('./helpers/fetchCollectionStats');

module.exports = {
    name: 'test',
    description: 'Helps dev testing',
    devOnly: true,
    testOnly: true,

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        console.log(await fetchCollectionStats('oogy'));
        interaction.editReply('logged');
    }
}