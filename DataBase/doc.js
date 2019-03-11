const mongoose = require('mongoose')

const schema_doc = new mongoose.Schema({
    //_id will come from mlab as the upload occures
    isIndexed: {type: Boolean, required: true},
    name: {type: String, required: true},
    total_words: {type: Number, required: true},
    words: {type: Number, required: true},
    stopWords: {type: Number, required: true}
    //location???
})

const Doc = new mongoose.model('Doc', schema_doc)

module.exports = Doc