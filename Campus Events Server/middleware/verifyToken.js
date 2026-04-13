const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Token is not valid" });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;