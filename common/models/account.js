"use strict";

module.exports = function (Account) {
  const makeError = (statusCode, message) => {
    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
    return error;
  };

  const checkEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  };

  const checkPhone = (phone) => {
    const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return re.test(phone);
  };

  const checkAccount = (account) => {
    if (!account.firstName || typeof account.firstName !== "string")
      return false;
    if (!account.lastName || typeof account.lastName !== "string") return false;
    if (
      !account.email ||
      typeof account.email !== "string" ||
      !checkEmail(account.email)
    )
      return false;
    if (
      !account.phone ||
      typeof account.phone !== "string" ||
      !checkPhone(account.phone)
    )
      return false;
    if (!account.mailAddress || typeof account.mailAddress !== "string")
      return false;
    if (!account.occupation || typeof account.occupation !== "string")
      return false;
    if (!account.username || typeof account.username !== "string") return false;
    if (!account.password || typeof account.password !== "string") return false;
    return true;
  };

  Account.beforeRemote("create", function (ctx, instance, next) {
    const account = ctx.req.body;
    if (!checkAccount(account)) {
      return next(makeError(401, "Invalid data format!"));
    }
    account.email = account.email.toLowerCase();
    Account.findOne(
      {
        where: {
          or: [
            {
              username: account.username,
            },
            {
              email: account.email.toLowerCase(),
            },
          ],
        },
      },
      function (err, account) {
        if (account) {
          return next(makeError(401, "Existed username or email!"));
        }
        next();
      }
    );
  });

  Account.loginHandler = function (username, password, cb) {
    Account.login(
      {
        username,
        password,
      },
      "user",
      function (err, token) {
        if (err) return cb(err);
        cb(null, token);
      }
    );
  };
  Account.remoteMethod("loginHandler", {
    description: "login user with username and password",
    http: { path: "/loginHandler", verb: "post" },
    accepts: [
      { arg: "username", type: "string" },
      { arg: "password", type: "string" },
    ],
    returns: { arg: "user", type: "object", root: true },
  });
};
