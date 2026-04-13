const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('otpVerification', {
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('student', 'organizer'),
            allowNull: false
        },
        otp_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        otp_expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize,
        tableName: 'otp_verifications',
        timestamps: false,
        indexes: [
        ]
    });
};