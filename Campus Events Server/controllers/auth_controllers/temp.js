const bcrypt = require('bcrypt');
const { user: User } = require('../../models');

(async () => {
    try {
        // Generate the hash using your local bcrypt environment
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Update the dummy users in the database directly
        await User.update(
            { password: hashedPassword },
            { where: { email: ['alice.organizer@example.com', 'bob.organizer@example.com', 'charlie.pending@example.com'] } }
        );
        console.log("Successfully updated passwords for dummy organizers! You can now log in with 'password123'.");
    } catch (error) {
        console.error("Error updating passwords:", error);
    }
})();
