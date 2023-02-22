module.exports = (sequelize, Sequelize) => {
  const Contract = sequelize.define("contracts", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
    body : {
      type: Sequelize.STRING(1000),
    },
    response : {
      type: Sequelize.STRING(1000),
    },
    params : {
      type: Sequelize.STRING(1000),
    },
    query: {
      type: Sequelize.STRING(1000),
    },
    isActive: {
      type: Sequelize.BOOLEAN,
    },
    roleId :{
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: "TIMESTAMP",
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updatedAt: {
      type: "TIMESTAMP",
      defaultValue: sequelize.literal(
      "CURRENT_TIMESTAMP"
      ),
      allowNull: false,
    },
  });

  return Contract;
};
