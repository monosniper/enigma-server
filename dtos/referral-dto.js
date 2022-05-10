module.exports = class ReferralDto {
    id;
    user;
    ref_code;
    isActive;

    constructor(model) {
        this.id = model._id;
        this.user = model.user;
        this.ref_code = model.ref_code;
        this.isActive = model.isActive;
    }
}