const mongoose = require("mongoose");
const Joi = require('joi');

const storiesSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 40,
        minlength: 2,
    },
    content: {
        type: String,
        required: true,
    },
    surce: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    image_public_id:{
        type: String
    }

},{ timestamps: true })

const Stories = mongoose.model("Stories", storiesSchema);


const validateCreateStory = (obj)=>{
    const schema = Joi.object({
        title: Joi.string().required().trim().max(40).min(2),
        content: Joi.string().required().trim(),
        surce: Joi.string().required().trim(),
        image: Joi.string()
    })

    return schema.validate(obj)
}


const validateUpdateStory = (obj)=>{
    const schema = Joi.object({
        title: Joi.string().trim().max(40).min(2),
        content: Joi.string().trim(),
        surce: Joi.string().trim(),
        image: Joi.string()
    })

    return schema.validate(obj)
}

module.exports = { Stories, validateCreateStory, validateUpdateStory };