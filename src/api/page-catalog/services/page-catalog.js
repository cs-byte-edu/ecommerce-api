'use strict';

/**
 * page-catalog service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::page-catalog.page-catalog');
