const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Check for token in cookies or Authorization header (Bearer token)
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied: No Token Provided!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
    }
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({ success: false, message: "Access Denied: You do not have permission to perform this action." });
        }
    };
};

module.exports = { verifyToken, checkRole };