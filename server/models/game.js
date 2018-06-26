const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: String,
    id: Number,
    decks: Array,
});

const Game = mongoose.model('Game', gameSchema);
module.exports = {Game: Game, gameSchema: gameSchema};
