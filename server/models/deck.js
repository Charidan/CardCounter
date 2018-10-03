const mongoose = require('mongoose');
const cardSchema = require('./card.js').cardSchema;

const deckSchema = new mongoose.Schema({
    name: String,
    gameid: mongoose.Schema.ObjectId,
    cards: [cardSchema],
    drawnCard: cardSchema,

    // deck settings
    showCardsLocked: Boolean,
    showCardsEditing: Boolean,
    drawTransferTargets: [mongoose.Schema.ObjectId],
    anyTransferTargets: [mongoose.Schema.ObjectId],

    // legal actions
    legalDraw: Boolean,
    legalShuffle: Boolean,
    legalDestroy: Boolean,
    legalPutOnBottom: Boolean,
    legalAcceptTransfer: Boolean,
    legalPerformTransferDrawn: Boolean,
    legalPerformTransferAny: Boolean,


}, {
    usePushEach: true
});

deckSchema.methods.drawCard = function()
{
    let card = this.cards.shift();
    this.drawnCard = card;
    return card;
};

deckSchema.methods.putOnBottom = function(card, faceup)
{
    card.faceup = faceup ? faceup : false;
    this.drawnCard = null;
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
