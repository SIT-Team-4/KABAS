/**
 * @module validation/authSchema
 * @description Yup schemas for user registration and login.
 */
import * as yup from 'yup';

/** Validation schema for user registration. */
export const registerSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    email: yup.string().trim().email('Must be a valid email').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

/** Validation schema for user login. */
export const loginSchema = yup.object({
    email: yup.string().trim().email('Must be a valid email').required('Email is required'),
    password: yup.string().required('Password is required'),
});
