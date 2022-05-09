const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    bio: {type: String},
    number: {type: String, unique: true},
    ref_code: {type: String, unique: true},
}, {timestamps: true});

module.exports = model('User', UserSchema);