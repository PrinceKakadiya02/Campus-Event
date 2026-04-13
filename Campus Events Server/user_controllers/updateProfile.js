const db = require('../models');
const User = db.user; // Assuming sequelize-auto singularized 'users' to 'user'

const updateProfile = async (req, res) => {
    try {
        // The verifyToken middleware should attach the decoded user payload to req.user
        const userId = req.user.id;

        // Extract fields that are allowed to be updated.
        const { full_name, phone_number, department, academic_year, enrollment_no } = req.body;

        // Find the user by primary key
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Update the fields if they are provided in the request body
        if (full_name !== undefined) user.full_name = full_name;
        if (phone_number !== undefined) user.phone_number = phone_number;
        if (department !== undefined) user.department = department;
        if (academic_year !== undefined) user.academic_year = academic_year;
        if (enrollment_no !== undefined) user.enrollment_no = enrollment_no;

        // Save the updated user to the database
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                id: user.id,
                full_name: user.full_name,
                phone_number: user.phone_number,
                department: user.department,
                academic_year: user.academic_year,
                enrollment_no: user.enrollment_no
            }
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error while updating profile.",
            error: error.message
        });
    }
};

module.exports = updateProfile;