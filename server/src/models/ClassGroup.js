/**
 * @module models/ClassGroup
 * @description Sequelize model for class groups (semester/cohort containers for teams).
 */
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ClassGroup = sequelize.define('ClassGroup', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

export default ClassGroup;
