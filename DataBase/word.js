const mongoose = require('mongoose')

const schema_word = new mongoose.Schema({
    isStopWord: {type: Boolean, required: true},
    word: {type: String, required: true},
    docs_refs: [{type: String}],
    docs_hits: [{type: Number}]
})

const Word = new mongoose.model('Word', schema_word)

module.exports = Word