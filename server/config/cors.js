export const corsConfig = {
    origin: (origin, callback) => {
        console.log('🔗 CORS request from origin:', origin);

        // Allow same-origin requests, server-to-server (no Origin header), and file:// protocol (null origin)
        if (!origin || origin === 'null') return callback(null, true);

        // Allow the configured frontend
        const allowedFrontend = process.env.FRONTEND_URL || "http://localhost:5173";
        if (origin === allowedFrontend) return callback(null, true);

        // Allow same-origin requests when serving frontend from same domain
        if (process.env.SERVE_FRONTEND === 'true' && process.env.RENDER_EXTERNAL_HOSTNAME) {
            const serverUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
            if (origin === serverUrl) return callback(null, true);
        }

        // Allow admin frontend (different port)
        const allowedAdminFrontend = "http://localhost:5174";
        if (origin === allowedAdminFrontend) {
            console.log('✅ CORS allowed for admin frontend:', origin);
            return callback(null, true);
        }

        // Allow Chrome extension origins
        if (origin.startsWith('chrome-extension://')) return callback(null, true);

        // Allow major websites for extension functionality
        const allowedDomains = [
            'http://localhost:5174', // Admin frontend
            'https://www.facebook.com',
            'https://facebook.com',
            'https://www.reddit.com',
            'https://reddit.com',
            'https://twitter.com',
            'https://www.twitter.com',
            'https://x.com',
            'https://www.x.com',
            'https://instagram.com',
            'https://www.instagram.com',
            'https://youtube.com',
            'https://www.youtube.com',
            'https://linkedin.com',
            'https://www.linkedin.com'
        ];

        if (allowedDomains.includes(origin)) {
            console.log('✅ CORS allowed for:', origin);
            return callback(null, true);
        }

        console.log('❌ CORS blocked for:', origin);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Extension-Version',
        'X-Requested-With',
        'Accept',
        'Origin',
        'User-Agent',
        'DNT',
        'Cache-Control',
        'X-Mx-ReqToken',
        'Keep-Alive',
        'X-Requested-With'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    optionsSuccessStatus: 200,
    preflightContinue: false
};
