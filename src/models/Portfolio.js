const { Schema, model } = require('mongoose');

const portfolioInfo = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    walletAddresses: {
        type: Array,
        default: 0,
    }
})

module.exports = model('Portfolio', portfolioInfo);