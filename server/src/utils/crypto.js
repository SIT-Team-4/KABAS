import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Retrieve and validate the 32-byte encryption key from the environment.
 * @returns {Buffer} The encryption key as a Buffer.
 * @throws {Error} If ENCRYPTION_KEY is missing or not a valid 64-char hex string.
 */
function getKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error(
            'ENCRYPTION_KEY env var must be a 64-character hex string (32 bytes)',
        );
    }
    return Buffer.from(key, 'hex');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} Encrypted string in the format `iv:authTag:ciphertext` (hex-encoded).
 */
export function encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 * @param {string} text - The encrypted string in `iv:authTag:ciphertext` format.
 * @returns {string|null} The decrypted plaintext, or null if input is invalid.
 */
export function decrypt(text) {
    if (!text || typeof text !== 'string') return null;
    const parts = text.split(':');
    if (parts.length !== 3) return null;
    try {
        const [ivHex, tagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    } catch {
        return null;
    }
}
