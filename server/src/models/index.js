import sequelize from '../config/db.js';
import ClassGroup from './ClassGroup.js';
import Team from './Team.js';
import TeamCredential from './TeamCredential.js';

// ClassGroup → Team (one-to-many)
ClassGroup.hasMany(Team, { foreignKey: 'classGroupId', onDelete: 'SET NULL' });
Team.belongsTo(ClassGroup, { foreignKey: 'classGroupId' });

// Team → TeamCredential (one-to-one)
Team.hasOne(TeamCredential, { foreignKey: 'teamId', onDelete: 'CASCADE' });
TeamCredential.belongsTo(Team, { foreignKey: 'teamId' });

export {
    sequelize,
    ClassGroup,
    Team,
    TeamCredential,
};
