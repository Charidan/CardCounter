const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
    name: String,
    id: Number,
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
}, {
    usePushEach: true
});

deckSchema.methods.drawCard = function()
{
    let card = this.cards.shift();
    card.deck = null;
    card.save();
    return card;
};

deckSchema.methods.putOnBottom = function(card, faceup)
{
    card.faceup = faceup ? faceup : false;
    card.deck = this._id;
    card.save();
    this.cards.push(card);
};

deckSchema.methods.shuffle = function()
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

const Deck = mongoose.model('Deck', deckSchema);

module.exports = {Deck: Deck, deckSchema: deckSchema};
