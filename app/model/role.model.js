module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("roles", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    warnLimit: {
      type: Sequelize.INTEGER
    },
    rateLimit: {
      type: Sequelize.INTEGER
    },
    expireTokenTime :  {
      type: Sequelize.INTEGER
    }
  });

  return Role;
};
