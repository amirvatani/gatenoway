const {DATABASE_CONNECTION_STRING} = require("#constant/environment")
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  DATABASE_CONNECTION_STRING,{logging: false}
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../model/user.model.js")(sequelize, Sequelize);
db.history = require("../model/history.model.js")(sequelize, Sequelize);
db.role = require("../model/role.model.js")(sequelize, Sequelize);
db.contract = require("../model/contract.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});
db.history.belongsTo(db.user, {
  through: "id",
  foreignKey: "userId",
  otherKey: "id"
});
db.contract.belongsTo(db.role, {
  through: "id",
  foreignKey: "roleId",
  otherKey: "id"
});


db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
