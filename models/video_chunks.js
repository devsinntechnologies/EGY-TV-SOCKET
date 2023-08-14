
const { DataTypes } = require('sequelize');
const sequelize = require("../db/index");
const Video = require('./video');

const VideoChunks = sequelize.define('VideoChunks', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  // Define the table name
  tableName: 'video_chunks',
  // Disable automatic creation of createdAt and updatedAt fields
  timestamps: false,
});


// // Define associations after all models are defined
// VideoChunks.associate = () => {
//   VideoChunks.belongsTo(Video, { as: 'video', foreignKey: 'videoId', onDelete: 'CASCADE' });
// };

module.exports =  VideoChunks;
