/**
 * @module models/index
 * @description Registers Sequelize model associations and re-exports all models.
 */
import sequelize from '../config/db.js';
import ClassGroup from './ClassGroup.js';
import Team from './Team.js';
import TeamCredential from './TeamCredential.js';
import Task from './Task.js';
import User from './User.js';

// ClassGroup → Team (one-to-many)
ClassGroup.hasMany(Team, { foreignKey: 'classGroupId', onDelete: 'SET NULL' });
Team.belongsTo(ClassGroup, { foreignKey: 'classGroupId' });

// Team → TeamCredential (one-to-one)
Team.hasOne(TeamCredential, { foreignKey: 'teamId', onDelete: 'CASCADE' });
TeamCredential.belongsTo(Team, { foreignKey: 'teamId' });

// Team → Task (one-to-many)
Team.hasMany(Task, { foreignKey: 'teamId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Team, { foreignKey: 'teamId' });

export {
    sequelize,
    ClassGroup,
    Team,
    TeamCredential,
    Task,
    User,
};
