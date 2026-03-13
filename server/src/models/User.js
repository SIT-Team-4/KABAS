import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('instructor', 'admin'),
        defaultValue: 'instructor',
    },
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                // eslint-disable-next-line no-param-reassign
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                // eslint-disable-next-line no-param-reassign
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
    },
});

User.prototype.toSafeJSON = function toSafeJSON() {
    // eslint-disable-next-line no-unused-vars
    const { password, ...safe } = this.toJSON();
    return safe;
};

export default User;
