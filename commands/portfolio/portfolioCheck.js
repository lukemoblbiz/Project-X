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

            const chain = '0xe9ac0d6';
          
            const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
                address: '3fSPsKJWbBBc8RhZNQNYJnjiCBGCxdgnmTriVuHfDV8D',
                chain,
          });

            console.log(response.raw);
            interaction.editReply('logged');

          } catch (e) {
            console.error(e);
          }
    }
}