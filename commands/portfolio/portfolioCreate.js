const Portfolio = require('../../models/Portfolio');
const { Client, Interaction } = require('discord.js');

module.exports = {
    name: 'createportfolio',
    description: 'Create your portfolio.',
    devOnly: true,
    testOnly: true,

    callback: async (client, interaction) => {

        await interaction.deferReply();

        const query = new Portfolio({
            userId: interaction.user.id,
            guildId: interaction.guildId
        });
        const portfolio = await Portfolio.findOne(query);
        try {
            if(portfolio) {
                console.log(portfolio);
                interaction.editReply(`You already have an active portfolio. Use "/addwallet" to add a wallet.`);
            } else {
                const newPortfolio = new Portfolio({
                    userId: interaction.user.id,
                    guildId: interaction.guildId
                });

                await newPortfolio.save();
                interaction.editReply(`Portfolio successfully created`);
            }
        } catch(error) {
            console.log(`Error creating profile: ${error}`);
        }
    }
}