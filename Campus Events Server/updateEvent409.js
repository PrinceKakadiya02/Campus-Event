const { event: Event } = require('./models');

(async () => {
    try {
        const eventId = 409;
        const event = await Event.findByPk(eventId);

        if (!event) {
            console.error(`❌ Event with ID ${eventId} not found in the database.`);
            process.exit(1);
        }

        // Set dates far into the future so the frontend never hides this testing event
        const futureDate = new Date('2099-12-31');

        await event.update({
            event_date: futureDate,
            last_reg_date: futureDate,
            time: '11:59 PM',
            approval_status: 'approved' // Ensure it is approved so students can see it
        });

        console.log(`✅ Event ID ${eventId} ('${event.title}') updated successfully!`);
        console.log(`📅 It is now open for QR scanning today and visible to all students.`);
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error updating Event 409:`, error);
        process.exit(1);
    }
})();