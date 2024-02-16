const Portfolio = require('../../models/Portfolio');
const { Client, Interaction } = require('discord.js');

module.exports = {
    name: 'createportfolio',
    description: 'Create your portfolio.',
    devOnly: true,
    testOnly: true,

    callback: async (client, interaction) => {

        await interaction.deferReply({ ephemeral: true });

        const query = new Portfolio({
            userId: interaction.user.id,
            guildId: interaction.guildId
        });
        const portfolio = await Portfolio.findOne({
            userId: query.userId,
            guildId: query.guildId
        });
        try {
            if(!portfolio) {
                const newPortfolio = new Portfolio({
                    userId: interaction.user.id,
                    guildId: interaction.guildId
                });

                await newPortfolio.save();
                interaction.editReply(`Portfolio successfully created.`);
            } else {
                //portfolio exists
                interaction.editReply(`You already have an active portfolio.`);
            }
        } catch(error) {
            console.log(`Error creating profile: ${error}`);
        }
    }
}