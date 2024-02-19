const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');
const Moralis = require("moralis").default;
const { SolNetwork } = require("@moralisweb3/common-sol-utils");

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
            for (i = 0; i < portfolio.walletAddresses.length; i++){
                const response = await Moralis.SolApi.account.getPortfolio({
                    "network": "mainnet",
                    "address": portfolio.walletAddresses[i]
                });
                responseArr[i] = response;
            };

            //isolate tokens
            let tokenArr = [];
            let usdc = {};
            let solana = {};
            for(j = 0; j < responseArr.length; j++) {
                for(i = 0; i < responseArr[j].jsonResponse.tokens.length; i++) {
                    let tokenData = {
                        "amount" : responseArr[j].jsonResponse.tokens[i].amount,
                        "address" : responseArr[j].jsonResponse.tokens[i].mint,
                        "symbol" : responseArr[j].jsonResponse.tokens[i].symbol,
                        "name" : responseArr[j].jsonResponse.tokens[i].name
                    }
                    if (tokenData.symbol) {
                        switch(tokenData.symbol) {
                            case 'USDC':
                                usdc = tokenData;
                            case 'SOL':
                                solana = tokenData;
                            default :
                                tokenArr.push(tokenData);
                        }
                    }
                }
            }

            //isolate nfts
            let nftArr = [];
            for(j = 0; j < responseArr.length; j++) {
                for(i = 0; i < responseArr[j].jsonResponse.nfts.length; i++) {
                    const nftData = {
                        "amount" : responseArr[j].jsonResponse.nfts[i].amount,
                        "address" : responseArr[j].jsonResponse.nfts[i].mint,
                        "symbol" : responseArr[j].jsonResponse.nfts[i].symbol,
                        "name" : responseArr[j].jsonResponse.nfts[i].name
                    } 
                    if(nftData.symbol) {
                        nftArr.push(nftData)
                    }
                }
            }

            //tokens
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

            //solana
            let solanaPrice;
            try {
                const solResponse = await Moralis.SolApi.token.getTokenPrice({
                    "network": "mainnet",
                    "address": solana.address
                });
                solanaPrice = await response.jsonResponse.usdPrice
            } catch {
                solanaPrice = 0;
            }

            //usdc
            let usdcPrice;
            try {
                const solResponse = await Moralis.SolApi.token.getTokenPrice({
                    "network": "mainnet",
                    "address": usdc.address
                });
                usdcPrice = await response.jsonResponse.usdPrice
            } catch {
                usdcPrice = 0;
            }

            interaction.editReply('logged');

        } catch (e) {
            console.error(e);
            interaction.editReply('not logged :(')
        }
    }
}
