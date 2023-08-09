const Sequelize=require('sequelize')
const sequelize = new Sequelize('egy-liveStream', 'root', '', {
    host: "127.0.0.1",
    dialect : 'mysql',
  });
  sequelize.authenticate().then(function(){
        console.log("connection Established.");
      }).catch(function(error){
        console.log("error: "+error);
  });
module.exports=sequelize