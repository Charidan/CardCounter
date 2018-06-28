const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    value: Number,
    id: Number,
    gameid: Number,
    deckid: Number,
    faceup: Boolean,
});

const Card = mongoose.model('Card', cardSchema);
module.exports = {Card: Card, cardSchema: cardSchema};
