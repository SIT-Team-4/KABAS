/**
 * @module validation/classGroupSchema
 * @description Yup schemas for creating and updating class groups.
 * Update schema enforces that startDate and endDate must be provided together.
 */
import * as yup from 'yup';

/** Validation schema for creating a class group. */
export const createClassGroupSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    startDate: yup.date().required('Start date is required'),
    endDate: yup
        .date()
        .required('End date is required')
        .min(yup.ref('startDate'), 'End date must be after start date'),
});

/** Validation schema for updating a class group. Requires both dates if either is provided. */
export const updateClassGroupSchema = yup.object({
    name: yup.string().trim().min(1, 'Name cannot be empty'),
    startDate: yup.date(),
    endDate: yup
        .date()
        .min(yup.ref('startDate'), 'End date must be after start date'),
}).test(
    'dates-together',
    'Both startDate and endDate must be provided together',
    (value) => {
        const hasStart = value.startDate != null;
        const hasEnd = value.endDate != null;
        return hasStart === hasEnd;
    },
);
