/**
 * @module models/Task
 * @description Sequelize model for normalized tasks fetched from Jira and GitHub.
 * createdAt/updatedAt represent source timestamps, not DB auto-timestamps.
 */
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    externalId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
    },
    owner: {
        type: DataTypes.STRING,
        defaultValue: 'Unassigned',
    },
    ownerInitials: {
        type: DataTypes.STRING,
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bucket: {
        type: DataTypes.ENUM('todo', 'in_progress', 'completed', 'backlog'),
        allowNull: false,
    },
    rawStatus: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: DataTypes.DATE,
    },
    source: {
        type: DataTypes.ENUM('jira', 'github'),
        allowNull: false,
    },
    fetchedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['teamId', 'externalId', 'source'],
        },
    ],
});

export default Task;
