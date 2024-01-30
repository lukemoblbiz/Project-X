const { MessageEmbed, EmbedBuilder } = require('discord.js');
const axios = require('axios');

let notifiedCollections = [];

async function getMagicEdenCollections() {
  const response = await axios.get('https://api-mainnet.magiceden.dev/v2/collections');
  return response.data;
}

function sendCollectionEmbed(channel, collection) {
    const collectionEmbed = new EmbedBuilder() 
      .setColor('#ffcc00')
      .setTitle(`New Magic Eden Collection: ${collection.name}`)
      .setDescription(collection.description)
      //Error is this addfields. without it its working, not sure what the error is. 
      /*.addFields(
		{ name: 'Twitter', value: function() {
            if (collection.twitter.length != 0) {
                return `${collection.twitter}`;
            } else {
                return "Not Listed."
            }
        }},
		{ name: 'Discord', value: function() {
            if (collection.discord.length != 0) {
                return `${collection.discord}`;
            } else {
                return "Not Listed.";
            }
        }}
	    )*/
      .setTimestamp();
  
    channel.send({ embeds: [collectionEmbed] });
  }

function init(client) {
  setInterval(async () => {
    const magicEdenData = await getMagicEdenCollections();

    magicEdenData.forEach(collection => {
      if (!notifiedCollections.includes(collection.id)) {
        const channel = client.channels.cache.get('1201896282197856268');
        if (channel) {
          sendCollectionEmbed(channel, collection);
        }
        notifiedCollections.push(collection.id);
      }
    });
  }, 30000);
}



module.exports = {
  init
};