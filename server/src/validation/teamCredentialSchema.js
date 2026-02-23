import * as yup from 'yup';

export const createTeamCredentialSchema = yup.object({
    provider: yup
        .string()
        .oneOf(['jira', 'github'], 'Provider must be jira or github')
        .required('Provider is required'),
    baseUrl: yup.string().trim().nullable().default(null),
    email: yup.string().trim().nullable().default(null),
    apiToken: yup.string().required('API token is required'),
});

export const updateTeamCredentialSchema = yup.object({
    provider: yup
        .string()
        .oneOf(['jira', 'github'], 'Provider must be jira or github'),
    baseUrl: yup.string().trim().nullable(),
    email: yup.string().trim().nullable(),
    apiToken: yup.string(),
});
