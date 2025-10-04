import Joi from 'joi';

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        next();
    };
};

// Auth validation schemas
export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    plan: Joi.string().valid('personal', 'family', 'team').default('personal')
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).allow(''),
    timezone: Joi.string().max(50)
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required()
});

// Group validation schemas
export const inviteMemberSchema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).max(10).required(),
    role: Joi.string().valid('admin', 'member', 'child').default('member'),
    message: Joi.string().max(500).allow('')
});

export const acceptInvitationSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(6).max(100).required()
});

export const updateMemberRoleSchema = Joi.object({
    role: Joi.string().valid('admin', 'member', 'child').required()
});

// Detection validation schemas
export const detectionSubmissionSchema = Joi.object({
    detectedTerm: Joi.string().trim().min(1).max(100).required(),
    context: Joi.string().trim().min(1).max(1000).required(),
    site: Joi.object({
        url: Joi.string().uri().required(),
        title: Joi.string().trim().min(1).max(200).required()
    }).required(),
    aiResponse: Joi.object({
        isToxic: Joi.boolean().required(),
        confidence: Joi.number().min(0).max(1).required(),
        reason: Joi.string().trim().min(1).max(500).required(),
        modelVersion: Joi.string().max(50).default('roberta-v1'),
        language: Joi.string().valid('English', 'Tagalog', 'Mixed', 'fil', 'en').default('Mixed')
    }).required(),
    metadata: Joi.object({
        detectionMethod: Joi.string().valid('dictionary', 'ai', 'hybrid', 'term-based', 'context-aware').default('hybrid'),
        processingTime: Joi.number().min(0).default(0),
        extensionVersion: Joi.string().max(20),
        userAgent: Joi.string().max(500)
    }).default({})
});

export const detectionStatusUpdateSchema = Joi.object({
    status: Joi.string().valid('dismissed', 'reported', 'whitelisted').required()
});

// Export validation middleware
export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateUpdateProfile = validate(updateProfileSchema);
export const validateChangePassword = validate(changePasswordSchema);
export const validateInviteMember = validate(inviteMemberSchema);
export const validateAcceptInvitation = validate(acceptInvitationSchema);
export const validateUpdateMemberRole = validate(updateMemberRoleSchema);
export const validateDetectionSubmission = validate(detectionSubmissionSchema);
export const validateDetectionStatusUpdate = validate(detectionStatusUpdateSchema);



