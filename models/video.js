// Assuming you have Sequelize and the necessary setup already in place
const { DataTypes } = require('sequelize');
const sequelize = require("../db/index");
const Playlist = require('./playlist');
const  VideoChunks = require('./video_chunks');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  videoLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
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
  tableName: 'videos',
  // Disable automatic creation of createdAt and updatedAt fields
  timestamps: false,
});


Video.hasMany(VideoChunks, { as: 'video_chunks', foreignKey: 'videoId' });

module.exports = Video;
