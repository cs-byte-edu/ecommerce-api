"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/cart/add",
      handler: "cart.addToCart",
      config: {
        // policies: ["global::is-authenticated"],
      },
    },
  ],
};
