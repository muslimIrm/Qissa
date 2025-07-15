const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifiyToken")
const asyncHandler = require("express-async-handler")


router.post("/verifytoken", verifyToken, asyncHandler(async (req, res)=>{
    const user = req.user;

    res.status(200).json({message: "successfully!", user: user})
}))

module.exports = router