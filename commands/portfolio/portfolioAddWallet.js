const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');
const Moralis = require("moralis").default;

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

        //checks validity
        let isValidWallet = true;
        try {
            await Moralis.SolApi.account.getPortfolio({
                "network": "mainnet",
                "address": interaction.options.getString('address')
            });
        } catch (e) {
            isValidWallet = false;
        }

        //finds portfolio
        const query = {
            userId: interaction.user.id,
            guildId: interaction.guildId
        };

        try {
            const portfolio = await Portfolio.findOne(query);
            if(portfolio.walletAddresses.length < 5 && isValidWallet) {

                portfolio.walletAddresses.push(
                    interaction.options.getString('address')
                );
                await portfolio.save();

                interaction.editReply("Wallet successfully added.");
            } else {
                interaction.editReply('You already have 5 wallets or this is an invalid wallet.');
            }

        //!portfolio
        } catch (error) {
            interaction.editReply('You must create a portfolio.');
        } 
    }
}