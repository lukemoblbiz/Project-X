const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

async function getMagicEdenStats(symbol) {
  const apiUrl = `https://api-mainnet.magiceden.dev/v2/collections/${symbol}/stats`;
  const response = await axios.get(apiUrl);
  return response.data;
}

function createStatsEmbed(symbol, stats) {
    return new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle(`Stats for ${symbol}`)
      .addFields(
        { name: 'Floor Price', value: stats.floorPrice || 'Not Available', inline: true },
        { name: 'Listed Count', value: stats.listedCount || 'Not Available', inline: true },
        { name: 'Avg 24h Price', value: stats.avgPrice24hr || 'Not Available', inline: true },
        { name: 'All Volume', value: stats.volumeAll || 'Not Available', inline: true },
      )
      .setTimestamp();
  }
  
  module.exports = {
    getMagicEdenStats,
    createStatsEmbed
  };