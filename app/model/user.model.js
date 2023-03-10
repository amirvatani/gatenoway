module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    ip: {
      type: Sequelize.STRING
    },
    isActive : {
      type : Sequelize.BOOLEAN
    },
    warned : {
      type: Sequelize.INTEGER
              }
  });



  return User;
};
