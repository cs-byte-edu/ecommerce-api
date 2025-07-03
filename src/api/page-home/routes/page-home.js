"use strict";

// const middlewares = require("../../../../config/middlewares");

/**
 * page-home router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::page-home.page-home", {
  config: {
    find: {
      middlewares: ["api::page-home.home-populate"],
    },
  },
});
