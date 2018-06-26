var mongoose = require('mongoose');

var gameSchema = new mongoose.Schema({
    name: String,
    id: Number,
});

var Game = mongoose.model('Game', gameSchema);
module.exports = {Game: Game, languageSchema: gameSchema};
