const mongoose = require("mongoose");
const Joi = require('joi');
const jwt = require("jsonwebtoken")
const usersSchema = mongoose.Schema({
    fullname: {
        type: String,
        maxlength: 75,
        minlength: 5,
        trim: true,
        required: true,
    },
    username: {
        type: String,
        maxlength: 16,
        minlength: 3,
        trim: true,
        required: true,
        unique: true,
    },
    acount_icon: {
        type: String,
        defult: "defultImage"
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
}, { timestamps: true });

usersSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username, email: this.email },
    process.env.SECRET);
};


const Users = mongoose.model("Users", usersSchema);


const validationRegister = (obj) => {
    const schema = Joi.object({
        fullname: Joi.string().trim().min(5).max(75).required(),
        username: Joi.string().trim().min(5).max(75).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });

    return schema.validate(obj, { abortEarly: false }); 
};

const validationLogin = (obj) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(obj, { abortEarly: false }); 
};


module.exports = {Users, validationRegister, validationLogin}