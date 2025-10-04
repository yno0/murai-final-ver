import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            console.log('✅ Email transporter initialized');
        } catch (error) {
            console.error('❌ Failed to initialize email transporter:', error);
        }
    }

    async sendInvitationEmail(to, inviterName, groupName, invitationToken) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            const invitationUrl = `${frontendUrl}/invite/${invitationToken}`;

            const mailOptions = {
                from: {
                    name: process.env.FROM_NAME || 'Murai',
                    address: process.env.FROM_EMAIL || process.env.SMTP_USER
                },
                to: to,
                subject: `You're invited to join ${groupName} on Murai`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #015763; margin: 0;">🛡️ MURAi Family Protection</h1>
                        </div>

                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin-top: 0;">You're invited to join ${groupName}!</h2>
                            <p style="margin: 0;"><strong>${inviterName}</strong> has invited you to join their family protection group on MURAi.</p>
                        </div>

                        <div style="margin: 20px 0;">
                            <h3 style="color: #015763;">🌟 What you'll get:</h3>
                            <ul style="color: #555; line-height: 1.6;">
                                <li><strong>Real-time content filtering</strong> - Automatic detection of inappropriate content</li>
                                <li><strong>Family monitoring</strong> - Parents can monitor children's online exposure</li>
                                <li><strong>Safe browsing reports</strong> - Regular updates on online activity</li>
                                <li><strong>Customizable protection</strong> - Adjust settings for each family member</li>
                            </ul>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${invitationUrl}"
                               style="background-color: #015763; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                                🚀 Accept Invitation & Get Protected
                            </a>
                        </div>

                        <div style="background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="margin: 0; color: #0c5460; font-size: 14px;">
                                <strong>💡 Quick Setup:</strong> Once you accept, you'll be guided through installing the MURAi browser extension for instant protection.
                            </p>
                        </div>

                        <p style="color: #666; font-size: 14px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="${invitationUrl}" style="color: #015763;">${invitationUrl}</a>
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                        <p style="color: #999; font-size: 12px; text-align: center;">
                            This invitation will expire in 48 hours. If you didn't expect this invitation, you can safely ignore this email.<br>
                            MURAi - Keeping families safe online, one click at a time.
                        </p>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Invitation email sent:', result.messageId);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Failed to send invitation email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendWelcomeEmail(to, userName) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }

            const mailOptions = {
                from: {
                    name: process.env.FROM_NAME || 'Murai',
                    address: process.env.FROM_EMAIL || process.env.SMTP_USER
                },
                to: to,
                subject: 'Welcome to Murai!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Welcome to Murai, ${userName}!</h2>
                        <p>Thank you for joining Murai. We're excited to help you and your family stay safe online.</p>
                        <p>Here's what you can do next:</p>
                        <ul>
                            <li>Install the Murai browser extension</li>
                            <li>Configure your content filtering preferences</li>
                            <li>Invite family members to your group</li>
                            <li>Set up monitoring and reporting</li>
                        </ul>
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <p>Best regards,<br>The Murai Team</p>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent:', result.messageId);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            return { success: false, error: error.message };
        }
    }

    async testConnection() {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }

            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return { success: true };

        } catch (error) {
            console.error('❌ Email service connection failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;
