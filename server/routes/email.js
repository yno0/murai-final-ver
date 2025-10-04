import express from 'express';
import emailService from '../services/emailService.js';

const router = express.Router();

// Debug email configuration
router.get('/debug', (req, res) => {
    const config = {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER ? 'Set' : 'Missing',
        smtpPass: process.env.SMTP_PASS ? 'Set' : 'Missing',
        fromEmail: process.env.FROM_EMAIL,
        fromName: process.env.FROM_NAME
    };
    
    res.json({
        success: true,
        message: 'Email configuration status',
        config: config
    });
});

// Test email endpoint (for development only)
router.post('/test', async (req, res) => {
    try {
        const { to, type = 'welcome' } = req.body;

        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        let emailTemplate;

        switch (type) {
            case 'welcome':
                emailTemplate = emailService.generateWelcomeEmail('Test User', `${frontendUrl}/login`);
                break;
            case 'invitation':
                emailTemplate = emailService.generateInvitationEmail(
                    'John Doe', 
                    'Test Group', 
                    `${frontendUrl}/invite/test123`,
                    'This is a test invitation message!'
                );
                break;
            case 'password-reset':
                emailTemplate = emailService.generatePasswordResetEmail(
                    'Test User', 
                    `${frontendUrl}/reset-password?token=test123`
                );
                break;
            case 'email-verification':
                emailTemplate = emailService.generateEmailVerificationEmail(
                    'Test User', 
                    `${frontendUrl}/verify-email?token=test123`
                );
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email type. Use: welcome, invitation, password-reset, or email-verification'
                });
        }

        const result = await emailService.sendEmail({
            to: to,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
        });

        if (result.success) {
            res.json({
                success: true,
                message: `${type} email sent successfully`,
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send email',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default router;
