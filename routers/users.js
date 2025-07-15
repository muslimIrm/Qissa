const express = require("express");
const router = express.Router();
const verifyTokenAndUser = require("../middlewares/verifyToken")
const asyncHandler = require("express-async-handler")
const { Users, validationRegister, validationLogin } = require("../models/Users")
const bcrypt = require("bcryptjs");
const fs = require("fs/promises")
const upload = require("../middlewares/upload")
const cloudinary = require("../utils/cloudinary");
const { BlacklistedToken } = require("../models/BlacklistedTokens");





/*
 * @route   POST /users/register
 * @desc    Create a new user account
 * @access  Public
*/

router.post("/users/register", upload.single("account_icon"), asyncHandler(async (req, res) => {
  // //  Validate input

  console.log("🔥 Body:", req.body);
  console.log("🔥 File:", req.file);
  const { error } = validationRegister(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }


  const { fullname, username, email, password } = req.body;
  const data = { fullname, username, email }
  const existingUser = await Users.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    if (existingUser.username === username) {
      return res.status(400).json({ message: "Username is already taken" });
    }
    if (existingUser.email === email) {
      return res.status(400).json({ message: "Email is already registered" });
    }
  }
  //  Hash password
  data.password = await bcrypt.hash(password, 10);
  console.log("file:", req.file)

  if (req.file) {
    const inputPath = req.file.path;
    try {
      const uploadImage = await cloudinary.uploader.upload(inputPath, {
        folder: "Qissa-images",
        resource_type: "image"
      })

      data.account_icon = uploadImage.secure_url;
    } catch (error) {
      return res.status(500).json({ message: "Failed to upload image", error: error.message });
    } finally {
      try {
        await fs.unlink(inputPath);
      } catch (unlinkError) {
        console.error("Failed to delete temp file:", unlinkError.message);
      }
    }
  }
  //  Create and save the user
  const user = new Users(data);

  const result = await user.save();
  if (!result) {
    return res.status(500).json({ message: "Failed to create account." });
  }

  //  Remove password before sending the response
  const { password: _, ...userWithoutPassword } = result.toObject();
  const token = user.generateToken()
  return res.status(201).json({
    message: "Account created successfully.",
    token,
    user: userWithoutPassword
  });
}));

/*
 * @route   POST /users/login
 * @desc    Login a user
 * @access  Public
*/

router.post("/users/login", asyncHandler(async (req, res) => {
  const { error } = validationLogin(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, password } = req.body
  const user = await Users.findOne({ email })
  if (!user) {
    return res.status(404).json({ message: "User not found (404)." })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" })
  }

  const token = user.generateToken();
  const { password: _, ...userWithoutPassword } = user.toObject()
  res.status(200).json({
    message: "Login Successfully!",
    token,
    user: userWithoutPassword
  })
}))

/*
 * @route   POST /users/logout
 * @desc    Log out a user
 * @access  pravite
*/


router.post("/users/logout", verifyTokenAndUser, asyncHandler(async (req, res)=>{
  const token = req.token;

  const invalidToken = await new BlacklistedToken({
    token
  })

  await invalidToken.save()
  if(!invalidToken){
    return res.status(400).json({message: "somethigns went wrong."})
  }

  res.status(200).json({message: "logout successufully!"})
}))




module.exports = router;