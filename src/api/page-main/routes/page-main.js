"use strict";

const middlewares = require("../../../../config/middlewares");

/**
 * page-main router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::page-main.page-main", {
  config: {
    find: {
      middlewares: ["api::page-main.page-main"],
    },
  },
});
