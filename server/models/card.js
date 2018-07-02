const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    value: String,
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck' },
    faceup: Boolean,
}, {
    usePushEach: true
});

const Card = mongoose.model('Card', cardSchema);
module.exports = {Card: Card, cardSchema: cardSchema};
