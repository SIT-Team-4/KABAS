import USER_TEST_API_KEY from './test-api-key.js';

export default function getTestApiKey() {
    // Prefer a user-editable local key for reviewers.
    if (USER_TEST_API_KEY && USER_TEST_API_KEY.length > 0) {
        return USER_TEST_API_KEY;
    }

    const key = process.env.TEST_API_KEY;
    if (!key) {
        throw new Error('TEST_API_KEY not set. For local dev create .env.test or set TEST_API_KEY in your environment, or put a key into server/test/test-api-key.js for local testing.');
    }
    return key;
}
