const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');
const Moralis = require("moralis").default;
const { SolNetwork } = require("@moralisweb3/common-sol-utils");
const fetchCollectionStats = require('./helpers/fetchCollectionStats');


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

            //solana price
            let solanaPrice;
            while(typeof solanaPrice != 'number') {
                try {
                    const solResponse = await Moralis.SolApi.token.getTokenPrice({
                        "network": "mainnet",
                        "address" : "So11111111111111111111111111111111111111112"
                    });
                    solanaPrice = solResponse.jsonResponse.usdPrice;
                } catch {
                    console.log('failed solana');
                }
            }
            console.log('solana success: ' + solanaPrice);

            let usdcPrice;
            while(typeof usdcPrice != 'number') {
                try {
                    const usdcResponse = await Moralis.SolApi.token.getTokenPrice({
                        "network": "mainnet",
                        "address" : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                    });
                    usdcPrice = usdcResponse.jsonResponse.usdPrice;
                } catch {
                    console.log('failed USDC');
                }
            }
            console.log('USDC success: ' + usdcPrice);

            //usdc price
            /*let usdcPrice;
                const usdcResponse = await Moralis.SolApi.token.getTokenPrice({
                    "network": "mainnet",
                    "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                });
                usdcPrice = usdcResponse.jsonResponse.usdPrice; */
        
            //full response
            let responseArr = [];
            for (i = 0; i < portfolio.walletAddresses.length; i++){
                try {
                    const response = await Moralis.SolApi.account.getPortfolio({
                        "network": "mainnet",
                        "address": portfolio.walletAddresses[i]
                    });
                    responseArr[i] = response;
                } catch {
                    responseArr[i]  = 0;
                }
            };

            //isolate tokens
            let tokenArr = [];
            let usdc = [];
            let solana = [];
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
                                usdc.push(tokenData);
                                break;
                            case 'SOL' || 'WSOL':
                                solana.push(tokenData);
                                break;
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
                        "symbol" : responseArr[j].jsonResponse.nfts[i].symbol,
                        "names" : [responseArr[j].jsonResponse.nfts[i].name]
                    } 
                    if(nftData.symbol) {
                        nftArr.push(nftData);
                    }
                }
            }

            //merge nfts of same collection
            for(i = 0; i < nftArr.length; i++) {
                for(j = i+1; j < nftArr.length; j++)  {
                    if(nftArr[i].symbol ===  nftArr[j].symbol) {
                        nftArr[i].names.push(nftArr[j].names[0]);
                        nftArr.splice(j, 1);
                    }
                }
            }

            //token price
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
                        tokenArr.splice(i, 1);
                        i--;
                    }
                } catch {
                    tokenArr.splice(i, 1);
                    i--;
                }
            };
            
            //nft price
            let nftPriceArr = [];
            for(i = 0; i < nftArr.length; i++) {
                try {
                    const nftPrice = await fetchCollectionStats(nftArr[i].symbol);
                    if(nftPrice) {
                        nftPriceArr[i] = nftPrice * solanaPrice * nftArr[i].names.length / 1000000000;
                    } else {
                        nftArr.splice(i, 1);
                        i--;
                    }
                } catch (e) {
                    nftArr.splice(i, 1);
                    i--;
                }
            }

            interaction.editReply('logged');

        } catch (e) {
            console.error(e);
            interaction.editReply('not logged :(');
        }
    }
}
