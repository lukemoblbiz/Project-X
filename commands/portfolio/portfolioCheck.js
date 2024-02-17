const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');
const Moralis = require("moralis").default;

module.exports = {
    name: 'checkportfolio',
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
                try {
                    const response = await Moralis.SolApi.account.getPortfolio({
                        "network": "mainnet",
                        "address": portfolio.walletAddresses[i]
                    });
                    responseArr[i] = response;
                } catch (e) {
                    invalidWallets.push(portfolio.walletAddresses[i]);
                }
            };

            //isolate tokens
            let tokenArr = [];
            for(j = 0; j < responseArr.length; j++) {
                for(i = 0; i < responseArr[j].jsonResponse.tokens.length; i++) {
                    let tokenData = {
                        "name" : responseArr[j].jsonResponse.tokens[i].name,
                        "symbol" : responseArr[j].jsonResponse.tokens[i].symbol,
                        "amount" : responseArr[j].jsonResponse.tokens[i].amount
                    }
                    if (tokenData.symbol) {
                        tokenArr.push(tokenData);
                    }
                }
            }

            //isolate nfts
            let nftArr = [];
            for(j = 0; j < responseArr.length; j++) {
                for(i = 0; i < responseArr[j].jsonResponse.nfts.length; i++) {
                    let nftData = {
                        "name" : responseArr[j].jsonResponse.nfts[i].name,
                        "symbol" : responseArr[j].jsonResponse.nfts[i].symbol,
                        "amount" : responseArr[j].jsonResponse.nfts[i].amount
                    }
                    if(nftData.symbol) {
                        nftArr.push(nftData);
                    }
                }
            }

            //build reply
            //tokens
            let reply = "";
            if(tokenArr.length != 1) {
                reply = reply.concat('Tokens: \n');
                tokenArr.forEach((token) => {
                    reply = reply.concat(token.name, " - ", token.amount, "\n");
                });
            }

            //nfts
            if(nftArr.length != 0) {
                reply = reply.concat('\nNFTS:\n');
                nftArr.forEach((nft) => {
                    reply = reply.concat(nft.name, " - ", nft.amount, "\n");
                });
            }

            //invalid wallets
            if(invalidWallets.length != 0) {
                reply = reply.concat("\nInvalid Wallets:\n");
                invalidWallets.forEach((wallet) => {
                    reply = reply.concat(wallet, "\n")
                });
            }
            interaction.editReply(reply);

        } catch (e) {
            console.error(e);
            interaction.editReply('Invalid wallet');
        }
      }
    }