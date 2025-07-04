const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet")
const cors = require("cors")
const connectionWithMongooseDB = require("./mongooseDB/ConnectionMongoose")
const TodoyVerse = require("./routers/verse")
const stories = require("./routers/stories")
// Connecation with mongooseDB database
connectionWithMongooseDB(app)

// Middleware & Global Config
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use("/uploads", express.static("uploads"))

// Routers

app.use("/api", TodoyVerse)
app.use("/api", stories)

