"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async me(ctx) {
    // 1. Перевіряємо, чи користувач автентифікований.
    // Якщо ні, політика 'global::isAuthenticated' вже поверне помилку.
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("You are not authenticated.");
    }

    // 2. Використовуємо Entity Service для пошуку замовлень.
    // Ми шукаємо замовлення, де поле 'user' (або як воно у вас називається)
    // дорівнює ID поточного користувача.
    const orders = await strapi.entityService.findMany("api::order.order", {
      filters: {
        user: {
          id: user.id,
        },
      },
      // populate: ['your_relations'], // Розкоментуйте, щоб завантажити зв'язані дані
    });

    // 3. Повертаємо знайдені замовлення.
    return orders;
  },
}));
