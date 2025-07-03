"use strict";

/**
 * `home-populate` middleware
 */

const populate_ = {
  section_block: {
    populate: "*",
  },
};

const populate = {
  section_block: {
    on: {
      "layout.section-category": {
        populate: {
          category: {
            populate: {
              products: {
                populate: ["brand", "image", "primary_category"],
              },
            },
          },
        },
      },
      "layout.section-benefits": {
        populate: {
          benefits: {
            populate: {
              image: true,
            },
          },
        },
      },
      "blocks.category-tabs": {
        populate: {
          category: {
            populate: {
              products: {
                populate: ["brand", "image", "primary_category"],
              },
            },
          },
        },
      },
      "blocks.category-card": {
        populate: {
          category: {
            populate: {
              children: true,
            },
          },
        },
      },
    },
  },
};
// TODO: sort
module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    strapi.log.info("In home-populate middleware.");
    ctx.query.populate = populate;
    await next();
  };
};
