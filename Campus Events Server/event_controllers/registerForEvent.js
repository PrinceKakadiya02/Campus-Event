const { event: Event, userRegistration: UserRegistration } = require('../models');

const registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const { registation_type, full_name, email, phone_number, team_members = [] } = req.body;

        if (!registation_type || !full_name || !email || !phone_number) {
            return res.status(400).json({ success: false, message: "Please provide all required fields: registation_type, full_name, email, and phone_number." });
        }

        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found." });
        }

        // The leader counts as 1 member. Calculate the remaining required members.
        const requiredMembersCount = (event.no_of_team_members || 1) - 1;

        if (team_members.length !== requiredMembersCount) {
            return res.status(400).json({
                success: false,
                message: `This event requires a team size of ${event.no_of_team_members}. Please provide exactly ${requiredMembersCount} additional team member(s).`
            });
        }

        for (let i = 0; i < team_members.length; i++) {
            if (!team_members[i].name || !team_members[i].email) {
                return res.status(400).json({ success: false, message: `Please provide both 'name' and 'email' for team member ${i + 1}.` });
            }
        }

        const existingRegistration = await UserRegistration.findOne({
            where: {
                event_id: eventId,
                user_id: userId
            }
        });

        if (existingRegistration) {
            return res.status(409).json({ success: false, message: "You are already registered for this event." });
        }

        const newRegistration = await UserRegistration.create({
            event_id: eventId,
            user_id: userId,
            registation_type,
            full_name,
            email,
            phone_number,
            parent_id: null // The leader or solo participant has no parent
        });

        if (requiredMembersCount > 0 && team_members.length > 0) {
            const membersData = team_members.map(member => ({
                event_id: eventId,
                user_id: userId, // Associates the member with the leader's account ID
                registation_type, // Typically 'team'
                full_name: member.name,
                email: member.email,
                phone_number: phone_number, // Default to the leader's phone number to satisfy NOT NULL constraint
                parent_id: newRegistration.id // This is where the magic happens! Links to the leader.
            }));
            await UserRegistration.bulkCreate(membersData);
        }

        return res.status(201).json({ success: true, message: "Successfully registered for the event." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = registerForEvent;