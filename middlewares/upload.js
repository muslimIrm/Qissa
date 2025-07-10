const multer = require("multer");
const path = require("path")
const cloudinary = require("../utils/cloudinary");


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "tmp/")
    },
    filename: (req, file, cb)=>{
        const ext = path.extname(file.originalname);
        const name = Date.now()+"-"+ Math.round(Math.random()* 1e9) + ext;
        cb(null, name)
    }
});





const upload = multer({ storage })





module.exports = upload;