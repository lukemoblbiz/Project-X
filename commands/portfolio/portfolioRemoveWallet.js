const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');

module.exports = {
    name: 'removewallet',
    description: 'Remove a wallet to be tracked under your portfolio.',
    devOnly: true,
    testOnly: true,
    options: [{
        name: 'address',
        description: 'Adress of the wallet being removed',
        type: 3,
        required: true,
    }],
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
            const index = portfolio.walletAddresses.indexOf(
                interaction.options.getString('address')
            );
            if(index != -1) {
                const test = portfolio.walletAddresses.splice(index, 1);

                await portfolio.save();
                interaction.editReply("Wallet successfully deleted.");
            } else {
                interaction.editReply("This wallet does not exist.");
            }
        } catch (error)  {
            console.log(`Error deleting wallet: ${error}`);
        }
    }
}