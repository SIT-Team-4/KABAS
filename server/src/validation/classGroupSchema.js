import * as yup from 'yup';

export const createClassGroupSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    startDate: yup.date().required('Start date is required'),
    endDate: yup
        .date()
        .required('End date is required')
        .min(yup.ref('startDate'), 'End date must be after start date'),
});

export const updateClassGroupSchema = yup.object({
    name: yup.string().trim(),
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
