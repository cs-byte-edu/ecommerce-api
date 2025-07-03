"use strict";

/**
 * `home-populate` middleware
 */

const populate = {
  featured_products: {
    populate: {
      categories: {
        fields: ["id", "name", "slug", "description"],
        populate: {
          products: {
            fields: ["slug", "name", "id", "final_price"],
          },
        },
      },
    },
  },
  deals: {
    populate: {
      categories: {
        fields: ["id", "name", "slug", "description"],
        populate: {
          products: {
            fields: [
              "id",
              "name",
              "slug",
              "final_price",
              "brand",
              "description",
            ],
            populate: "*", // або замініть '*' на конкретні поля, якщо хочете бути точним
          },
        },
      },
    },
  },
  benefits: {
    populate: {
      benefits: {
        fields: ["id", "title", "description"],
        populate: {
          image: {
            fields: ["url", "alternativeText"],
          },
        },
      },
    },
  },
  products_popular: {
    populate: {
      categories: {
        populate: {
          products: {
            populate: {
              image: {
                fields: ["url", "alternativeText"],
              },
              category_main: {
                fields: ["name"],
              },
            },
          },
        },
      },
    },
  },
};

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info("In home-populate middleware.");
    if (!ctx.query) {
      ctx.query = {};
    }

    // Об'єднуємо існуючі параметри з нашим populate
    // ctx.query = {
    //   ...ctx.query,
    //   populate: {
    //     ...ctx.query.populate,
    //     ...populate.populate,
    //   },
    // };

    ctx.query.populate = populate;
    await next();
  };
};
