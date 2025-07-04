const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token undifind or without Bearer" })
    }

    const tokenValue = token.split(" ")[1];
    try {

        const decoded = jwt.verify(tokenValue, process.env.SECRET)
        if (decoded.isAdmin) {
            next()
        }
        else {
            return res.status(403).json({ message: "Access denied. Not admin." });
        }
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }


}


module.exports = verifyToken;