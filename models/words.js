const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const WordSchema = new Schema({

    word:{
        type: String,
        required: true
    },
    partOfSpeech:{
        type: String,
        required: true
    },
    definition:{
        type: String,
        required: false
    },

    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('words', WordSchema)