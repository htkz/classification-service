"use strict";

const supertest = require("supertest");
const api = supertest("http://localhost:3000/api/");
const app = require("../server/server");

const invalidUserData = {
  username: "htkzmo",
  password: "1234",
};

const validUserData = {
  username: "htkzmo",
  password: "1234",
  firstName: "Mo",
  middleName: ".",
  lastName: "Sun",
  email: "fdafa@gmail.com",
  phone: "441-200-8709",
  mailAddress: "153 south st",
  occupation: "Student",
};

const invalidCredential = {
  username: "htkzmo",
  password: "12345",
};

const validCredential = {
  username: "htkzmo",
  password: "1234",
};

describe("Register API tests", () => {
  before("wipe DB (if used with other tests)", function (done) {
    app.dataSources.mongodb.automigrate(function (err) {
      done(err);
    });
  });

  it("should return 401 if there are missing properties in post data", (done) => {
    api
      .post("/accounts/")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it("should return 401 if email format is not correct", (done) => {
    api
      .post("/accounts/")
      .send({ ...validUserData, email: "fdfad@g" })
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it("should return 401 if phone format is not correct", (done) => {
    api
      .post("/accounts/")
      .send({ ...validUserData, phone: "132-321-432" })
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it("should return 200 if the post data format is correct", (done) => {
    api
      .post("/accounts/")
      .send(validUserData)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it("should return 401 if there is duplicated username or email", (done) => {
    api
      .post("/accounts/")
      .send(validUserData)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe("Login API tests", () => {
  it("should return 401 if the credential in wrong", (done) => {
    api
      .post("/accounts/loginHandler")
      .send(invalidCredential)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it("should return 200 if the credential in correct", (done) => {
    api
      .post("/accounts/loginHandler")
      .send(validCredential)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe("Classification API tests", () => {
  it("should return 401 if the user doesn't have credential", (done) => {
    api
      .post("/nlps/classify")
      .send({ text: "test" })
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it("should return 200 if the user have credential", (done) => {
    api
      .post("/accounts/loginHandler")
      .send(validCredential)
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        const token = res.body.id;
        api
          .post("/nlps/classify")
          .query({ access_token: token })
          .send({ text: "test" })
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            done();
          });
      });
  });
});
