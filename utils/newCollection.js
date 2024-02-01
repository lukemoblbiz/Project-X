const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const statsCollection = require('./statsCollection');

let notifiedCollections = [];

async function getMagicEdenCollections(apiUrl) {
  const response = await axios.get(apiUrl);
  return response.data;
}

async function sendCollectionEmbed(channel, collection) {

    const stats = await statsCollection.getMagicEdenStats(collection.symbol);
    const collectionEmbed = new EmbedBuilder() 
      .setColor('#ffcc00')
      .setTitle(`New Collection: ${collection.name}`)
      .addFields(
        { name: 'Description:', value: `${collection.description}` },
        //{ name: 'Info:', value: ""},
        //{ name: 'FP:', value: ``, inline: true},
        //{ name: 'Volume:', value: ``, inline: true},
        { name: '\u200B', value: '\u200B' },
        { name: 'Magic Eden', value: `[Click here](https://magiceden.io/marketplace/${collection.symbol})`, inline: true },
        { name: 'Tensor (if exists)', value: `[Click here](https://tensor.trade/trade/${collection.symbol})`, inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: 'Twitter', value: collection.twitter && collection.twitter.length > 0 ? `[Click here](${collection.twitter})` : 'Not Listed.', inline: true },
        { name: 'Discord', value: collection.discord && collection.discord.length > 0 ? `[Click here](${collection.discord})` : 'Not Listed.', inline: true },
        { name: 'Website', value: collection.website && collection.website.length > 0 ? `[Click here](${collection.website})` : 'Not Listed.', inline: true },
      )
      .setImage(collection.image)
      .setTimestamp();
  
    channel.send({ embeds: [collectionEmbed] });
  }

function init(client) {
  setInterval(async () => {
    const magicEdenData = await getMagicEdenCollections('https://api-mainnet.magiceden.dev/v2/collections');

    magicEdenData.forEach(collection => {
      if (!notifiedCollections.includes(collection.id)) {
        const channel = client.channels.cache.get('1201896282197856268');
        if (channel) {
          sendCollectionEmbed(channel, collection);
        }
        notifiedCollections.push(collection.id);
      }
    });
  }, 1000);
}



module.exports = {
  init
};