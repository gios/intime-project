var Sequelize = require('sequelize');

var User = sequelize.define('User',
{
    username: { type: Sequelize.STRING, unique: true },
    password: Sequelize.STRING
}, {
    freezeTableName: true
});

module.exports = User;
