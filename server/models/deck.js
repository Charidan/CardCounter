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
    let currentIndex = this.cards.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this.cards[currentIndex];
        this.cards[currentIndex] = this.cards[randomIndex];
        this.cards[randomIndex] = temporaryValue;
    }
};

module.exports = {Deck: Deck, deckSchema: deckSchema};
