var mongoose = require('mongoose');

var languageSchema = new mongoose.Schema({
    name: String,
    id: Number,
});

var Language = mongoose.model('Language', languageSchema);
module.exports = {Language: Language, languageSchema: languageSchema};
