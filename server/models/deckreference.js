const mongoose = require('mongoose');

const deckRefSchema = new mongoose.Schema({
    name: String,
    deckid: mongoose.Schema.ObjectId,

}, {
    usePushEach: true
});

const DeckRef = mongoose.model('DeckRef', deckRefSchema);

module.exports = {DeckRef: DeckRef, deckRefSchema: deckRefSchema};
