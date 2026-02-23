import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('crypto utils', () => {
    const VALID_KEY =
        'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
    let encrypt;
    let decrypt;

    beforeEach(async () => {
        vi.stubEnv('ENCRYPTION_KEY', VALID_KEY);
        // Re-import to pick up env change
        const mod = await import('./crypto.js');
        encrypt = mod.encrypt;
        decrypt = mod.decrypt;
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should encrypt and decrypt a string back to the original', () => {
        const plaintext = 'my-secret-api-token';
        const encrypted = encrypt(plaintext);
        expect(encrypted).not.toBe(plaintext);
        expect(encrypted).toContain(':');
        expect(decrypt(encrypted)).toBe(plaintext);
    });

    it('should produce different ciphertexts for the same input (random IV)', () => {
        const plaintext = 'same-input';
        const a = encrypt(plaintext);
        const b = encrypt(plaintext);
        expect(a).not.toBe(b);
        expect(decrypt(a)).toBe(plaintext);
        expect(decrypt(b)).toBe(plaintext);
    });

    it('should handle empty string', () => {
        const encrypted = encrypt('');
        expect(decrypt(encrypted)).toBe('');
    });

    it('should handle special characters', () => {
        const plaintext = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`';
        const encrypted = encrypt(plaintext);
        expect(decrypt(encrypted)).toBe(plaintext);
    });

    it('should throw if ENCRYPTION_KEY is missing', () => {
        vi.stubEnv('ENCRYPTION_KEY', '');
        expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY');
    });

    it('should throw if ENCRYPTION_KEY is wrong length', () => {
        vi.stubEnv('ENCRYPTION_KEY', 'tooshort');
        expect(() => encrypt('test')).toThrow('64-character');
    });
});
