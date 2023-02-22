const Connect = require("connect-pg-simple");
const session = require("express-session");
/*************/
const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const AdminJSSequelize = require("@adminjs/sequelize");
/*************/
const db = require("#model/index");

const {
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
  ADMIN_PANEL_COOKIE_SECRET,
  ADMIN_PANEL_SESSION_SECRET,
  DATABASE_CONNECTION_STRING,
} = require("#constant/environment");

function getAdminPanelRouter() {
  AdminJS.registerAdapter(AdminJSSequelize);

  const DEFAULT_ADMIN = {
    email: DEFAULT_ADMIN_USERNAME,
    password: DEFAULT_ADMIN_PASSWORD,
  };

  const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
  };

  const admin = new AdminJS({
    resources: [
      {
        resource: db.contract,
        options: {
          id: "contracts",
        },
      },
      {
        resource: db.role,
        options: {
          id: "roles",
        },
      },
      {
        resource: db.user,
        options: {
          id: "users",
        },
      },
      {
        resource: db.history,
        options: {
          id: "histories",
        },
      },
    ],
  });

  admin.watch();

  const ConnectSession = Connect(session);
  const sessionStore = new ConnectSession({
    conObject: {
      connectionString: DATABASE_CONNECTION_STRING,
      ssl: process.env.NODE_ENV === "production",
    },
    tableName: "session",
    createTableIfMissing: true,
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: ADMIN_PANEL_COOKIE_SECRET,
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: ADMIN_PANEL_SESSION_SECRET,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "gateway 1.0.0",
    }
  );
  return {adminRouter,admin};
}

module.exports = {
  getAdminPanelRouter,
};
