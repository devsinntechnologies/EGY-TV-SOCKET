// Assuming you have Sequelize and the necessary setup already in place
const { DataTypes } = require('sequelize');
const sequelize = require("../db/index");
const Video = require('./video');

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at', // Set the field name in the database
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at', // Set the field name in the database
  },
}, {
  // Define the table name
  tableName: 'playlists',
  // Disable automatic creation of createdAt and updatedAt fields
  timestamps: false,
});

// Define associations after all models are defined
Playlist.hasMany(Video, { as: 'videos', foreignKey: 'playlistId' });
// Video.belongsTo(Playlist, { as: 'playlist', foreignKey: 'playlistId' });

module.exports = Playlist;
