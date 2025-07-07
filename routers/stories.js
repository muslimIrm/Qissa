// Import the libraries
const express = require("express");
const router = express.Router();
const { Stories, validateCreateStory, validateUpdateStory } = require("../models/Stories")
const asyncHandler = require("express-async-handler")
const verifyToken = require("../middlewares/verifiyToken")
const multer = require("multer")
const path = require("path");
const fs = require("fs");
const upload = require("../middlewares/upload")
const cloudinary = require("../utils/cloudinary")
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/")
//     },
//     filename: (req, file, cb) => {
//         const date = Date.now()
//         const parsed = path.parse(file.originalname.replace(/\s+/g, '-'));
//         const name = parsed.name;
//         const ext = path.extname(file.originalname)
//         cb(null, `${name}-${date}${ext}`)
//     }
// })

// const upload = multer({ storage })


// GET Router

router.get("/stories", asyncHandler(async (req, res) => {
    let limit = parseInt(req.query.limit, 10) || 5
    let page = parseInt(req.query.page, 10) || 1


    if (limit < 1) limit = 5;
    if (page < 1) page = 1;

    const skip = (page - 1) * limit


    const totalStories = await Stories.countDocuments();
    const storiesRaw = await Stories.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
    if (storiesRaw.length === 0) {
        return res.status(404).json({ message: "No stories found." })
    }
    
    res.status(200).json({
        limit,
        page,
        totalPages: Math.ceil(totalStories / limit),
        totalStories: totalStories,
        storiesRaw,
    })
}))

router.get("/stories/:id", asyncHandler(async (req, res) => {
    
    const story = await Stories.findById(req.params.id)
    if(!story){
        return res.status(404).json({message: "sory not found."})
    }
    res.status(200).json({
        story
    })
}))



// POST Router

router.post("/stories", upload.single("image"), verifyToken, asyncHandler(async (req, res) => {
    const { error } = validateCreateStory(req.body)
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message })
    }
    const { title, content, surce, } = req.body;
    const imageUrl =  req.file?.path || null;
    const image_public_id = req.file?.filename || req.file?.public_id || null
    const story = await Stories.create({ title, content, surce, image: imageUrl, image_public_id })
    res.status(201).json({
        success: true,
        story: story,
    })
}))

router.put("/stories/:id", upload.single("image"), verifyToken, asyncHandler(async (req, res) => {
    const { error } = validateUpdateStory(req.body)
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message })
    }

    const { title, content, surce, } = req.body;
    const file = req.file 


    const oldStory = await Stories.findById(req.params.id)
    if(!oldStory){
        return res.status(404).json({ message: "Story not found." });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (surce !== undefined) updateData.surce = surce;
    if(file){
        if(oldStory.image_public_id){
            await cloudinary.uploader.destory(oldStory.image_public_id)
        }
        updateData.image = file.path;
        updateData.image_public_id= file.filename || file.public_id
    }



    const story = await Stories.findByIdAndUpdate(req.params.id, 
        {$set: updateData}, {new: true}
    )

    
    res.status(200).json({
        success: true,
        story: story,
    })
}))

// Delete

router.delete("/stories/:id", verifyToken, asyncHandler(async (req, res)=>{
    const story = await Stories.findById(req.params.id)

    if(!story){
        return res.status(404).json({message: "Story not found."})
    }

    if(story.image){
        
        await cloudinary.uploader.destroy(story.image_public_id)
    }

    await Stories.findByIdAndDelete(req.params.id)

    res.status(200).json({message: "Story has been deleted successfully."})
}))


module.exports = router