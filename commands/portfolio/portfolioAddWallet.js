const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');

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
        await interaction.deferReply();

        try {
            const portfolio = Portfolio.find({
                userId: interaction.user.id,
                guildId: interaction.guildId
            });
            console.log(portfolio);
            interaction.editReply(`hello`);

           /* if(portfolio) {
                if(portfolio.walletAddresses.length < 5) {
                    portfolio.walletAddresses.push(interaction.options.getString('address'));
                    console.log(portfolio.walletAdresses);
                } else {
                    //wallets > 5
                    interaction.editReply('You already have 5 wallets. Use "/removewallet" to clear space.');
                }
            } else {
                //!portfolio
                interaction.editReply(`You do not have an active portfolio. Use "/createportfolio" to make one`);
            } */
        } catch (error) {
            console.log(`Error creating profile: ${error}`);
        } 
    }
}