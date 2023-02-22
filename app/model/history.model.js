module.exports = (sequelize, Sequelize) => {
  const History = sequelize.define("history", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    headers: {
      type: Sequelize.STRING(1000),
    },
    timestamp : {
      type: Sequelize.STRING(1000),
    },
    rawHeaders : {
      type: Sequelize.STRING(1000),
    },
    httpVersion : {
      type: Sequelize.STRING(1000),
    },
    method : {
      type: Sequelize.STRING(1000),
    },
    url : {
      type: Sequelize.STRING(1000),
    },
    path : {
      type: Sequelize.STRING(1000),
    },
    body : {
      type: Sequelize.STRING(1000),
    },
    params : {
      type: Sequelize.STRING(1000),
    },
    query: {
      type: Sequelize.STRING(1000),
    },
    userId: {
      type: Sequelize.INTEGER,
    },
  });

  return History;
};
