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

            await Moralis.start({
            apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjFlYmRiNTg3LTQ2ZjMtNGVjMy1iMzVjLTBmZTk3MzMyYmM0YyIsIm9yZ0lkIjoiMzc3NDIxIiwidXNlcklkIjoiMzg3ODUyIiwidHlwZUlkIjoiZjBkMzMxMDEtNGY3MS00NGMwLTkwNTYtYzM1MzIzNzZmZDJhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDgwMjI0MDAsImV4cCI6NDg2Mzc4MjQwMH0.58ucItw_dPvfXiRd-P-8f_sSwXBRH9GSfBIlmjsSA7s"
            });
        
            //full response
            let responseArr = []
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
                        "symbol" : responseArr[j].jsonResponse.tokens[i].symbol,
                        "amount" : responseArr[j].jsonResponse.tokens[i].amount
                    }
                    if (tokenData.symbol) {
                        tokenArr.push(tokenData);
                    }
                }
            }

            let nftArr = [];
            for(j = 0; j < responseArr.length; j++) {
                for(i = 0; i < responseArr[j].jsonResponse.nfts.length; i++) {
                    let nftData = {
                        "symbol" : responseArr[j].jsonResponse.nfts[i].symbol,
                        "amount" : responseArr[j].jsonResponse.nfts[i].amount
                    }
                    if(nftData.symbol) {
                        nftArr.push(nftData);
                    }
                }
            }

            console.log(tokenArr);

            interaction.editReply('logged');
        } catch (e) {
            console.error(e);
            interaction.editReply('Invalid wallet');
        }
      }
    }