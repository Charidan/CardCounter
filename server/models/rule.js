var mongoose = require('mongoose');

let ruleSchema = new mongoose.Schema({
    id: Number,
    type: String,
    application: String,
    inputs: Array,
    outputs: Array,
});

let Rule = mongoose.model('Rule', ruleSchema);

module.exports = {
    Rule: Rule, ruleSchema: ruleSchema,
};
