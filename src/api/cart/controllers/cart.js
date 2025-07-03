"use strict";

/**
 * cart controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::cart.cart", ({ strapi }) => ({
  async addToCart(ctx) {
    const userId = ctx.request.body.user.id;
    console.log("USER", userId);

    const mockCart = await strapi.entityService.create("api::cart.cart", {
      data: {
        user: "mockUserID_001",
        items: ["Protein", "Creeatine"],
      },
    });

    ctx.send({ mockCart });
  },
}));
