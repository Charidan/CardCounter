const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    name: String,
    id: Number,
}, {
    usePushEach: true
});

const Game = mongoose.model('Game', gameSchema);
module.exports = {Game: Game, gameSchema: gameSchema};
