"use strict";

/**
 * `is-auth` policy
 */

module.exports = (policyContext, config, { strapi }) => {
  // Add your own logic here.
  strapi.log.info("In is-auth policy.");

  if (!policyContext.state.user) {
    return policyContext.unauthorized("Ви не авторизовані");
  }
  return true; // доступ дозволено
};
