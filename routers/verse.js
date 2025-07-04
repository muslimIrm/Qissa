const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const asyncHandler = require('express-async-handler')
const filePath = path.join(__dirname, "../data/quran.json");



let quranData = null
fs.readFile(filePath, "utf-8")
    .then(json => {quranData = JSON.parse(json)})
    .catch(err => {
        console.error("Failed to load Quran data:", err)
        process.exit(1)
    })

const randomVerse = async () => {
    if(!quranData){
        throw new Error("Quran data not loaded yet.");
    }
    try {
        const surahKeys = Object.keys(quranData);
        const randomIndex = Math.floor(Math.random() * surahKeys.length);
        const randomSurahKey = surahKeys[randomIndex];

        const versetLength = quranData[randomSurahKey].length;
        const randomverseIndex = Math.floor(Math.random() * versetLength);

        const randomverse = quranData[randomSurahKey][randomverseIndex];
        return randomverse;
    }
    catch (error) {
        console.error("Failed to get random verse:", error);
        throw new Error("Internal server error");
    }

}

router.get("/today-verse", asyncHandler(async (req, res) => {
    const verse = await randomVerse();
    console.log(verse)
    res.status(200).json(verse)
}))


module.exports = router