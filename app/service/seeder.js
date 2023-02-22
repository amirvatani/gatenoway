const db = require("./../model");
const Role = db.role;

async function initialSeed() {
  const roles = await Role.findAll();
  if (!roles.length) {
    await Role.create({
      id: 1,
      name: "user",
      warnLimit: 10,
      rateLimit: 10,
    });
  }
}

module.exports = {
  initialSeed,
};
