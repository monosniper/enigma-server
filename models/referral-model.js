const {Schema, model} = require('mongoose');

const ReferralSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    ref_code: {type: String, required: true},
    isActive: {type: Boolean, default: true},
}, {timestamps: true});

module.exports = model('Referral', ReferralSchema);