const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');
const Moralis = require("moralis").default;

module.exports = {
    name: 'networth',
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
        }

        try {
            const portfolio = await Portfolio.findOne(query);
        
            //full response
            let responseArr = [];
            let invalidWallets = [];
            for (i = 0; i < portfolio.walletAddresses.length; i++){
                const response = await Moralis.SolApi.account.getPortfolio({
                    "network": "mainnet",
                    "address": portfolio.walletAddresses[i]
                });
                responseArr[i] = response;
            };

            //isolate tokens
            let tokenArr = [];
            for(j = 0; j < responseArr.length; j++) {
                for(i = 0; i < responseArr[j].jsonResponse.tokens.length; i++) {
                    let tokenData = {
                        "amount" : responseArr[j].jsonResponse.tokens[i].amount,
                        "address" : responseArr[j].jsonResponse.tokens[i].mint,
                        "symbol" : responseArr[j].jsonResponse.tokens[i].symbol,
                    }
                    if (tokenData.symbol) {
                        tokenArr.push(tokenData);
                    }
                }
            }
            let tokenPriceArr = [];
            for(i = 0; i < tokenArr.length; i++) {
                try {
                    const response = await Moralis.SolApi.token.getTokenPrice({
                        "network": "mainnet",
                        "address": tokenArr[i].address
                    });
                    const price = await response.jsonResponse.usdPrice
                    if(price) {
                        tokenPriceArr[i] = price;
                    } else {
                        tokenPriceArr[i] = 0;
                    }
                } catch {
                    tokenPriceArr[i] = 0;
                }
            };
            console.log(tokenPriceArr);

            interaction.editReply('logged');

        } catch (e) {
            console.error(e);
            interaction.editReply('not logged :(')
        }
    }
}
