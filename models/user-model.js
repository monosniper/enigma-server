const {Schema, model, Types} = require('mongoose');

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    bio: {type: String},
    number: {type: String, unique: true},
    isActive: {type: Boolean, default: false},
    ref_code: {type: String, unique: true},
    activeUntil: {type: Date},
    balance: {type: Number, default: 0},
    token_rate: {type: Number, default: 0},
    refs: [
        {type: Schema.Types.ObjectId, ref: 'Referral'}
    ],
}, {timestamps: true});

module.exports = model('User', UserSchema);