module.exports = class UserDto {
    id;
    name;
    email;
    bio;
    number;
    ref_code;
    token_rate;
    balance;
    isActive;
    activeUntil;
    refs;

    constructor(model) {
        this.id = model._id;
        this.name = model.name;
        this.email = model.email;
        this.bio = model.bio;
        this.number = model.number;
        this.ref_code = model.ref_code;
        this.token_rate = parseFloat(model.token_rate / 1000).toFixed(4);
        this.balance = parseFloat(model.balance / 1000).toFixed(4);
        this.isActive = model.isActive;
        this.activeUntil = model.activeUntil;
        this.refs = {
            all: model.refs.length,
            active: model.refs.filter(ref => ref.isActive).length,
        };
    }
}