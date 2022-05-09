const {Schema, model} = require('mongoose');

const CardSchema = new Schema({
    fio: {type: String, required: true},
    email: {type: String, required: true},
    address: {type: String, required: true},
    post_index: {type: String, required: true},
    comment: {type: String},
}, {timestamps: true});

module.exports = model('Card', CardSchema);