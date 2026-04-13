const getMe = (req, res) => {
    // The user object is attached to the request by the verifyToken middleware
    if (!req.user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, user: req.user });
};

module.exports = getMe;