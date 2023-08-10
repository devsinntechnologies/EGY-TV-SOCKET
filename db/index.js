const Sequelize=require('sequelize')
const sequelize = new Sequelize('egy_us_dev', 'Stevprog', 'Arham786', {
    host: 'egy-us-dev.cfriqrksbe5r.us-east-1.rds.amazonaws.com',
    dialect : 'mysql',
  });
// const sequelize = new Sequelize('egy-livestream', 'root', '', {
//   host: "127.0.0.1",
//     dialect : 'mysql',
//   });
  sequelize.authenticate().then(function(){
        console.log("connection Established.");
      }).catch(function(error){
        console.log("error: "+error);
  });
module.exports=sequelize
    // type: 'mysql',
    // host:'egy-us-dev.cfriqrksbe5r.us-east-1.rds.amazonaws.com',
    // port: 3306,
    // username: 'Stevprog',
    // password: 'Arham786',
    // database: 'egy_us_dev',