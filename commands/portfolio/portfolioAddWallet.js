const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');

//interaction.options.getString('address'));

module.exports = {
    name: 'addwallet',
    description: 'Add a wallet to track under your portfolio.',
    devOnly: true,
    testOnly: true,
    options: [{
        name: 'address',
        description: 'Adress of the wallet being added',
        type: 3,
        required: true
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
            if(portfolio.walletAddresses.length < 5) {

                portfolio.walletAddresses.push(
                    interaction.options.getString('address')
                );
                await portfolio.save();

                interaction.editReply("Wallet successfully added.");
            } else {
                interaction.editReply('You already have 5 wallets.');
            }
        } catch (error) {
            console.log(`Error creating profile: ${error}`);
        } 
    }
}