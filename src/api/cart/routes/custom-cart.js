"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/cart/add",
      handler: "cart.addToCart",
    },
    {
      method: "GET",
      path: "/cart",
      handler: "cart.getCart",
    },
    {
      method: "PUT",
      path: "/cart/update",
      handler: "cart.updateItemQuantity",
    },
    {
      method: "DELETE",
      path: "/cart/clear",
      handler: "cart.clearCart",
    },
    {
      method: "DELETE",
      path: "/cart/remove/:productId",
      handler: "cart.removeCartItem",
    },
    {
      method: "POST",
      path: "/cart/sync",
      handler: "cart.syncGuestCart",
    },
  ],
};
