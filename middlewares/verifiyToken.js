const jwt = require("jsonwebtoken");
const { Users } = require("../models/Users")
const { BlacklistedToken } = require("../models/BlacklistedTokens");
const verifyTokenAndUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token is missing or malformed." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const blacklisted = await BlacklistedToken.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ message: "This token has been revoked." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User no longer exists." });
        }

        req.user = user;
        req.toekn = token
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = { verifyTokenAndUser };
