const { Client, Interaction } = require('discord.js');
const Portfolio = require('../../models/Portfolio');
const Moralis = require("moralis").default;
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
            console.log('Response array set');

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
            console.log('Token arrays set');

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
            console.log('Nft array set');

            //merge nfts of same collection
            for(i = 0; i < nftArr.length; i++) {
                for(j = i+1; j < nftArr.length; j++)  {
                    if(nftArr[i].symbol ===  nftArr[j].symbol) {
                        nftArr[i].names.push(nftArr[j].names[0]);
                        nftArr.splice(j, 1);
                    }
                }
            }
            console.log('Nfts merged');

            //token price
            let tokenPriceArr = [];
            let totalTokenPrice = 0;
            let firstToken = -1;
            let secondToken = -1;
            let thirdToken = -1;
            for(i = 0; i < tokenArr.length; i++) {
                try {
                    const response = await Moralis.SolApi.token.getTokenPrice({
                        "network": "mainnet",
                        "address": tokenArr[i].address
                    });
                    const price = await response.jsonResponse.usdPrice
                    if(price) {
                        tokenPriceArr[i] = price;
                        totalTokenPrice += await price;

                        //find most expensive
                        if(firstToken === -1 || price  > tokenPriceArr[firstToken]) {
                            thirdToken = secondToken;
                            secondToken = firstToken;
                            firstToken = i;
                        } else if(secondToken === -1 ||  price > tokenPriceArr[secondToken]) {
                            thirdToken = secondToken;
                            secondToken = i;
                        } else if(thirdToken === -1 || price > tokenPriceArr[thirdToken]) {
                            thirdToken = i;
                        }

                    //!price
                    } else {
                        tokenArr.splice(i, 1);
                        i--;
                    }
                } catch {
                    tokenArr.splice(i, 1);
                    i--;
                }
            };
            console.log("Token data retrieved");
            
            //nft price
            let nftPriceArr = [];
            let totalNftPrice = 0;
            let firstNft = -1;
            let secondNft = -1;
            let thirdNft = -1;
            for(i = 0; i < nftArr.length; i++) {
                try {
                    const nftPrice = await fetchCollectionStats(nftArr[i].symbol);
                    if(nftPrice) {
                        nftPriceArr[i] = await nftPrice * solanaPrice * nftArr[i].names.length / 1000000000;
                        totalNftPrice += nftPriceArr[i];

                        //most expensive
                        if(firstNft === -1 || nftPriceArr[i] / nftArr[i].names.length > nftPriceArr[firstNft] / nftArr[firstNft].names.length) {
                            thirdNft = secondNft;
                            secondNft = firstNft;
                            firstNft = i;
                        } else if(secondNft === -1 || nftPriceArr[i] / nftArr[i].names.length > nftPriceArr[secondNft] / nftArr[secondNft].names.length) {
                            thirdNft = secondNft;
                            secondNft = i;
                        } else if(thirdNft === -1 || nftPriceArr[i] / nftArr[i].names.length > nftPriceArr[thirdNft] / nftArr[thirdNft].names.length) {
                            thirdNft = i;
                        }
                    } else {
                        nftArr.splice(i, 1);
                        i--;
                    }
                } catch (e) {
                    nftArr.splice(i, 1);
                    i--;
                }
            }
            console.log('Nft data retrieved');

            //solana + usdc in profile
            let solanaProfile = 0;
            for(i = 0; i < solana.length; i++) {
                try{
                solanaProfile += parseInt(solana[i].amount);
                } catch (e) {
                    console.log('SOL failed\n' + e)
                }
            }
            let usdcProfile = 0;
            for(i = 0; i < usdc.length; i++) {
                try {
                    usdcProfile += parseInt(await usdc[i].amount);
                } catch (e) {
                    console.log('USDC failed\n' + e);
                }
            }

            //top nfts
            let firstNftSentence;
            let secondNftSentence;
            let thirdNftSentence;
            try{
                firstNftSentence =  `\n\nTop NFTs: \n${nftArr[firstNft].names[0]} ($${nftPriceArr[firstNft] / nftArr[firstNft].names.length})`;
            } catch {
                firstNftSentence = '';
            }
            try{
                secondNftSentence  = `, ${nftArr[secondNft].names[0]} ($${nftPriceArr[secondNft] / nftArr[secondNft].names.length})`;
            } catch {
                secondNftSentence = '';
            }
            try{
                thirdNftSentence = `, ${nftArr[thirdNft].names[0]} ($${nftPriceArr[thirdNft] / nftArr[thirdNft].names.length})`;
            } catch {
                thirdNftSentence = '';
            }

            //top tokens
            let firstTokenSentence;
            let secondTokenSentence;
            let thirdTokenSentence;
            try{
                firstTokenSentence =  `\n\nTop Tokens: \n${tokenArr[firstToken].name} ($${tokenPriceArr[firstToken]}`;
            } catch {
                firstTokenSentence = ``;
            }
            try{
                secondTokenSentence  = `, ${tokenArr[secondToken].names[0]} ($${tokenPriceArr[secondToken]})`;
            } catch {
                secondTokenSentence = '';
            }
            try{
                thirdTokenSentence = `, ${tokenArr[thirdToken].names[0]} ($${tokenPriceArr[thirdToken]})`;
            } catch {
                thirdTokenSentence = '';
            }


            console.log(totalNftPrice + totalTokenPrice + (solanaProfile * solanaPrice) + (usdcProfile * usdcPrice));
            console.log(solanaProfile);
            console.log(solanaPrice);
            console.log(usdcProfile);
            console.log(usdcPrice);
            console.log(totalNftPrice);
            console.log(totalTokenPrice);
            console.log(firstNftSentence + secondNftSentence + thirdNftSentence);
            console.log(firstTokenSentence + secondTokenSentence + thirdTokenSentence);
            finalMessage = `${interaction.user.tag}'s Portfolio\n
Networth: $${totalNftPrice + totalTokenPrice + (solanaProfile * solanaPrice) + (usdcProfile * usdcPrice)}\n\n
Solana: ${solanaProfile}SOL ($${solanaProfile * solanaPrice})\n
USDC: ${usdcProfile}USDC ($${usdcProfile  * usdcPrice})\n
NFTs: ${totalNftPrice / solanaPrice}SOL ($${totalNftPrice})\n
Tokens: $${totalTokenPrice}
${firstNftSentence}${secondNftSentence}${thirdNftSentence}
${firstTokenSentence}${secondTokenSentence}${thirdTokenSentence}
https://quickchart.io/chart?c={type:'doughnut',data:{labels:['NFTs','Tokens','Solana','Usdc'],datasets:[{data:[${Math.round(totalNftPrice)},${Math.round(totalTokenPrice)},${Math.round(solanaProfile * solanaPrice)},${Math.round(usdcProfile  * usdcPrice)}]}]}}`;


            console.log(finalMessage);
            //interaction.editReply(finalMessage);
            interaction.editReply(finalMessage);

        } catch (e) {
            console.error(e);
            interaction.editReply('error');
        }
    }
}
