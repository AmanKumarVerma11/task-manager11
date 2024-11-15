const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Task extends Model {}

Task.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'in_progress', 'completed'],
        defaultValue: 'pending'
    },
    priority: {
        type: DataTypes.ENUM,
        values: ['low', 'medium', 'high', 'urgent'],
        defaultValue : 'medium'
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Task'
});

module.exports = Task;
