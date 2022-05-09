module.exports = class UserDto {
    id;
    name;
    email;
    bio;
    number;
    ref_code;

    constructor(model) {
        this.id = model._id;
        this.name = model.name;
        this.email = model.email;
        this.bio = model.bio;
        this.number = model.number;
        this.ref_code = model.ref_code;
    }
}