const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
    name: String,
    id: Number,
    gameid: Number,
    cards: Array,
});

const Deck = mongoose.model('Deck', deckSchema);

Deck.methods.draw = function()
{
    return this.cards.shift();
};

Deck.methods.putOnBottom = function(card)
{
    // TODO validate adding a card already in the deck?
    this.cards.push(card);
};

Deck.methods.shuffle = function()
{
    // TODO implement shuffle
};

module.exports = {Deck: Deck, deckSchema: deckSchema};
