/**
 * @module models/TeamCredential
 * @description Sequelize model for team credentials. Encrypts email and apiToken at rest
 * using AES-256-GCM via custom getters/setters.
 */
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { encrypt, decrypt } from '../utils/crypto.js';

const TeamCredential = sequelize.define('TeamCredential', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    provider: {
        type: DataTypes.ENUM('jira', 'github'),
        allowNull: false,
    },
    baseUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const raw = this.getDataValue('email');
            if (!raw) return null;
            return decrypt(raw);
        },
        set(value) {
            if (value == null) {
                this.setDataValue('email', null);
                return;
            }
            this.setDataValue('email', encrypt(value));
        },
    },
    apiToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const raw = this.getDataValue('apiToken');
            if (!raw) return null;
            return decrypt(raw);
        },
        set(value) {
            if (value == null) {
                this.setDataValue('apiToken', null);
                return;
            }
            this.setDataValue('apiToken', encrypt(value));
        },
    },
});

export default TeamCredential;
