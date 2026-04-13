const bcrypt = require('bcrypt');
const { user: User } = require('./models');

(async () => {
    try {
        // Hash the generic password for all dummy users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const dummyStudents = Array.from({ length: 10 }).map((_, index) => {
            const i = index + 1;
            return {
                full_name: `Dummy Student ${i}`,
                email: `student${i}@example.com`,
                password: hashedPassword,
                phone_number: `987654321${i % 10}`,
                role: 'student',
                approval_status: 'approved',
                department: i % 2 === 0 ? 'Computer Engineering' : 'Information Technology',
                academic_year: ['FY', 'SY', 'TY', 'LY'][i % 4],
                enrollment_no: `24000100${i.toString().padStart(2, '0')}`
            };
        });

        await User.bulkCreate(dummyStudents);

        console.log("✅ 10 Dummy students inserted successfully!");
        console.log("🔑 You can log in using their email (e.g., student1@example.com) and the password: 'password123'");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inserting dummy students:", error);
        process.exit(1);
    }
})();