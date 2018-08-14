const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    _id: mongoose.Schema.ObjectId,
    value: String,
    faceup: Boolean,
}, {
    usePushEach: true
});

const Card = mongoose.model('Card', cardSchema);
module.exports = {Card: Card, cardSchema: cardSchema};
