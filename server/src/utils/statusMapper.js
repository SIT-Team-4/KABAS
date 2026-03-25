export const STATUS_BUCKETS = {
    todo: 'todo',
    in_progress: 'in_progress',
    completed: 'completed',
    backlog: 'backlog',
};

const BUCKET_PATTERNS = [
    {
        bucket: STATUS_BUCKETS.completed,
        patterns: [/\bdone\b/, /\bclosed\b/, /\bmerged\b/, /\breleased\b/, /\bresolved\b/, /\bshipped\b/],
    },
    {
        bucket: STATUS_BUCKETS.in_progress,
        patterns: [/in progress/, /in development/, /in review/, /in qa/, /\bbuilding\b/, /\bdebugging\b/],
    },
    {
        bucket: STATUS_BUCKETS.todo,
        patterns: [/to do/, /\btodo\b/, /\bopen\b/, /\bplanned\b/, /\bqueued\b/, /\bdraft\b/, /selected for development/],
    },
];

/**
 * Maps a raw status string to a STATUS_BUCKETS value using case-insensitive
 * keyword matching. Uses word-boundary matching for single-word keywords to
 * avoid false positives (e.g. "abandoned" should not match "done").
 * Falls back to 'backlog' for null, undefined, empty, or unrecognised statuses.
 *
 * @param {string|null|undefined} rawStatus
 * @returns {string} bucket name
 */
export function mapStatusToBucket(rawStatus) {
    if (!rawStatus) {
        return STATUS_BUCKETS.backlog;
    }

    const lower = rawStatus.toLowerCase();

    const match = BUCKET_PATTERNS.find(({ patterns }) => patterns.some((re) => re.test(lower)));

    return match ? match.bucket : STATUS_BUCKETS.backlog;
}
