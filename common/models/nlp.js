"use strict";

const natural = require("natural");
const classifierJSON = require("../../nlp/classifier.json");
const classifier = natural.BayesClassifier.restore(classifierJSON);

module.exports = function (Nlp) {
  Nlp.classify = function (text, cb) {
    const res = classifier.classify(text);
    cb(null, res);
  };
  Nlp.remoteMethod("classify", {
    description: "Classify user input",
    http: { path: "/classify", verb: "post" },
    accepts: [{ arg: "text", type: "string" }],
    returns: { arg: "type", type: "object", root: true },
  });
};
