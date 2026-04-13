const { user: User, event: Event } = require('./models');

(async () => {
    try {
        // 1. Find the specific organizer
        const organizer = await User.findOne({ where: { email: 'alice.organizer@example.com' } });

        if (!organizer) {
            console.error("❌ Organizer 'alice.organizer@example.com' not found. Please make sure the account exists.");
            process.exit(1);
        }

        // 2. Get today's date
        const today = new Date();

        // Make registration end tomorrow so it doesn't expire immediately
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 3. Create the event
        const newEvent = await Event.create({
            title: 'QR Code Testing Event',
            description: 'This is a temporary event specifically created to test the QR code attendance scanning feature.',
            category: 'Testing',
            event_date: today,
            time: '11:59 PM',
            last_reg_date: tomorrow,
            no_of_team_members: 1,
            location: 'Testing Lab',
            organizer_id: organizer.id,
            approval_status: 'approved' // Set to approved so it bypasses the admin check for testing
        });

        console.log(`✅ Event '${newEvent.title}' created successfully!`);
        console.log(`📅 Event Date & Last Registration: ${today.toISOString().split('T')[0]}`);
        console.log(`🆔 Event ID: ${newEvent.id}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating the QR testing event:", error);
        process.exit(1);
    }
})();