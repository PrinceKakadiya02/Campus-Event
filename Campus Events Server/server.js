require('dotenv').config();
const express = require('express');
const AuthRoutes = require('./routes/AuthRoutes');
const EventRoutes = require('./routes/EventRoutes');
const UserRoutes = require('./routes/UserRoutes');
const AdminRoutes = require('./routes/AdminRoutes');
const ContactRoutes = require('./routes/ContactRoutes');
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');


app.use(
    cors({
        origin: function (origin, callback) {
            const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5173", "http://127.0.0.1:5173"];

            // Allow requests with no origin (like mobile apps/Postman) or local network IPs
            if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://192.168.")) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use('/auth', AuthRoutes)
app.use('/events', EventRoutes)
app.use('/user', UserRoutes)
app.use('/admin', AdminRoutes)
app.use('/contact', ContactRoutes)

app.get("/", (req, res) => {
    return res.status(200).json({ status: "success", message: "Welcome to the Campus Event API Server" })
})

// 404 Catch-All Middleware
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 8800;

app.listen(PORT, "0.0.0.0", () => { console.log(`Server running on port ${PORT}`) })