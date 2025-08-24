"use strict";

/**
 * `page-main` middleware
 */

const populate = {
  main_content: {
    on: {
      "sections.section-category": {
        populate: {
          section_categories: {
            populate: {
              products: {
                populate: "*",
              },
            },
          },
        },
      },
      "sections.section-content": {
        populate: {
          content_categories: {
            populate: {
              content_items: {
                populate: ["media"],
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
    strapi.log.info("In page-main middleware.");
    // console.log(ctx.query);
    ctx.query.populate = populate;
    await next();
  };
};
