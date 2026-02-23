import * as yup from 'yup';

export const createTeamSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    classGroupId: yup.number().integer().nullable().default(null),
});

export const updateTeamSchema = yup.object({
    name: yup.string().trim().min(1, 'Name cannot be empty'),
    classGroupId: yup.number().integer().nullable(),
});
