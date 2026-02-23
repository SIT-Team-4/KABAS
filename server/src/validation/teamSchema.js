/**
 * @module validation/teamSchema
 * @description Yup schemas for creating and updating teams.
 */
import * as yup from 'yup';

/** Validation schema for creating a team. */
export const createTeamSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    classGroupId: yup.number().integer().nullable().default(null),
});

/** Validation schema for updating a team. Name must be non-empty if provided. */
export const updateTeamSchema = yup.object({
    name: yup.string().trim().min(1, 'Name cannot be empty'),
    classGroupId: yup.number().integer().nullable(),
});
