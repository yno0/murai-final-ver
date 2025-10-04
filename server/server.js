import app from './app.js';

const PORT = process.env.PORT || 5000;

// Start the server

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
