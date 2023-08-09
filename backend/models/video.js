const Sequelize = require("sequelize");
const sequelize = require("../db/index");

const Video = sequelize.define(
  "video",
  {
    // Model attributes are defined here
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    duration: {
      type: Sequelize.INTEGER,
      // allowNull: false,
    }
  },
);
module.exports=Video;