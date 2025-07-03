"use strict";

module.exports = {
  routes: [
    {
      // Метод HTTP-запиту
      method: "GET",

      // URL-шлях
      path: "/orders/me",

      // Обробник: 'назва-контролера.назва-дії'
      // У нашому випадку 'order.findMyOrders'
      handler: "order.me",

      // Додаткові налаштування (дуже важливо для безпеки!)
      config: {
        // Політики (policies) - це проміжні функції для додаткових перевірок
        policies: [],

        // Вказуємо, що цей роут вимагає аутентифікації
        // Без цього він буде доступний усім
        // auth: {
        //   scope: ["find"],
        // Можна перевикористати дозволи з існуючої дії 'find'
        // },
        auth: false,
      },
    },
    // Тут можна додавати інші кастомні роути
    // {
    //   method: 'POST',
    //   path: '/orders/special-action',
    //   handler: 'order.specialAction'
    // }
  ],
};
