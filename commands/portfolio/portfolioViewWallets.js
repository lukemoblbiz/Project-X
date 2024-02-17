const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');

module.exports = {
    name: 'viewwallets',
    description: 'View the wallets in your portfolio.',
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
        const portfolio = await Portfolio.findOne(query);
        try {
            let reply = "";
            portfolio.walletAddresses.forEach((wallet) => {
                reply = reply.concat(wallet, "\n");
            });
        
            interaction.editReply(reply);
        } catch (error) {
            console.log(`Error creating profile: ${error}`);
        } 
    }
}