export const STATUS_BUCKETS = {
    todo: 'todo',
    in_progress: 'in_progress',
    completed: 'completed',
    backlog: 'backlog',
};

const BUCKET_KEYWORDS = [
    {
        bucket: STATUS_BUCKETS.completed,
        keywords: ['done', 'closed', 'merged', 'released', 'resolved', 'shipped'],
    },
    {
        bucket: STATUS_BUCKETS.in_progress,
        keywords: ['in progress', 'in development', 'in review', 'in qa', 'building', 'debugging'],
    },
    {
        bucket: STATUS_BUCKETS.todo,
        keywords: ['to do', 'todo', 'open', 'planned', 'queued', 'draft', 'selected for development'],
    },
];

/**
 * Maps a raw status string to a STATUS_BUCKETS value using case-insensitive
 * keyword matching. Falls back to 'backlog' for null, undefined, empty, or
 * unrecognised statuses.
 *
 * @param {string|null|undefined} rawStatus
 * @returns {string} bucket name
 */
export function mapStatusToBucket(rawStatus) {
    if (!rawStatus) {
        return STATUS_BUCKETS.backlog;
    }

    const lower = rawStatus.toLowerCase();

    const match = BUCKET_KEYWORDS.find(({ keywords }) => keywords.some((kw) => lower.includes(kw)));

    return match ? match.bucket : STATUS_BUCKETS.backlog;
}
