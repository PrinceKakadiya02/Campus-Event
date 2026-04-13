const Joi = require('joi');

const registerValidation = Joi.object({
    full_name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.base': 'Full name should be a type of text',
            'string.empty': 'Full name cannot be an empty field',
            'string.min': 'Full name should have a minimum length of {#limit}',
            'string.max': 'Full name should have a maximum length of {#limit}',
            'any.required': 'Full name is a required field'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is a required field'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password should have a minimum length of {#limit}',
            'any.required': 'Password is a required field'
        }),
    phone_number: Joi.string()
        .pattern(/^[0-9]+$/)
        .min(10)
        .max(15)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must contain only digits',
            'string.min': 'Phone number should have a minimum length of {#limit}',
            'string.max': 'Phone number should have a maximum length of {#limit}',
            'any.required': 'Phone number is a required field'
        }),
    department: Joi.string()
        .max(50)
        .required()
        .messages({
            'any.required': 'Department is a required field'
        }),
    academic_year: Joi.string()
        .valid('FY', 'SY', 'TY', 'LY')
        .when('role', { is: 'student', then: Joi.required(), otherwise: Joi.optional() })
        .messages({
            'any.only': 'Academic year must be one of FY, SY, TY, LY',
            'any.required': 'Academic year is required'
        }),
    enrollment_no: Joi.string()
        .max(50)
        .when('role', { is: 'student', then: Joi.required(), otherwise: Joi.optional() })
        .messages({
            'any.required': 'Enrollment number is required'
        }),
    role: Joi.string()
        .valid('student', 'organizer')
        .required(),
    otp: Joi.string()
        .length(6)
        .required()
        .messages({
            'string.length': 'OTP must be 6 digits',
            'any.required': 'OTP is required'
        })
});

const sendOtpValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
});

module.exports = {
    registerValidation,
    sendOtpValidation
};
