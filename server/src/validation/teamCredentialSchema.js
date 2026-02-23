/**
 * @module validation/teamCredentialSchema
 * @description Yup schemas for creating and updating team credentials.
 * Jira provider requires baseUrl and email; GitHub does not.
 */
import * as yup from 'yup';

/** Validation schema for creating a team credential. */
export const createTeamCredentialSchema = yup.object({
    provider: yup
        .string()
        .oneOf(['jira', 'github'], 'Provider must be jira or github')
        .required('Provider is required'),
    baseUrl: yup
        .string()
        .trim()
        .url('baseUrl must be a valid URL')
        .when('provider', {
            is: 'jira',
            then: (schema) => schema.required('baseUrl is required for Jira'),
            otherwise: (schema) => schema.nullable().default(null),
        }),
    email: yup
        .string()
        .trim()
        .email('email must be a valid email')
        .when('provider', {
            is: 'jira',
            then: (schema) => schema.required('email is required for Jira'),
            otherwise: (schema) => schema.nullable().default(null),
        }),
    apiToken: yup.string().required('API token is required'),
});

/** Validation schema for updating a team credential. */
export const updateTeamCredentialSchema = yup.object({
    provider: yup
        .string()
        .oneOf(['jira', 'github'], 'Provider must be jira or github'),
    baseUrl: yup.string().trim().url('baseUrl must be a valid URL').nullable(),
    email: yup.string().trim().email('email must be a valid email').nullable(),
    apiToken: yup.string(),
});
