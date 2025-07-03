const { evaluate } = require("mathjs");

module.exports = {
  async afterCreate(event) {
    await updateFinalPrice(event.result);
  },
  async afterUpdate(event) {
    await updateFinalPrice(event.result);
  },
};

async function updateFinalPrice(product) {
  if (!product.id) return;

  // Завантажуємо повні дані з усіма полями
  const fullProduct = await strapi.entityService.findOne(
    "api::product.product",
    product.id,
    {
      populate: ["price_formula"],
    }
  );

  const computed = await computeFinalPrice(fullProduct);

  if (computed == null) {
    strapi.log.warn("Missing computed price.");
    return;
  }

  if (Number(fullProduct.final_price) === Number(computed)) {
    strapi.log.info("Final price is already correct, skipping update.");
    return;
  }

  await strapi.entityService.update("api::product.product", fullProduct.id, {
    data: { final_price: computed },
  });

  strapi.log.info(
    `Updated final_price to ${computed} for product ID ${fullProduct.id}`
  );
}

function getFormulaId(rel) {
  if (!rel) return null;

  if (Array.isArray(rel.set) && rel.set.length) {
    const first = rel.set[0];
    return typeof first === "object" ? first.id : first;
  }

  if (Array.isArray(rel.connect) && rel.connect.length) {
    const first = rel.connect[0];
    return typeof first === "object" ? first.id : first;
  }

  if (typeof rel === "number") {
    return rel;
  }

  if (typeof rel === "object" && rel.id) {
    return rel.id;
  }

  return null;
}

function extractPriceVars(raw) {
  if (!raw) return null;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (e) {
      strapi.log.error("Cannot parse price_variables:", e);
      return null;
    }
  }

  if (typeof raw === "object") {
    return raw;
  }

  return null;
}

async function computeFinalPrice(data) {
  const formulaID = getFormulaId(data.price_formula);
  if (!formulaID) {
    strapi.log.warn("No formula ID found.");
    return;
  }

  const formula = await strapi.db
    .query("api::price-formula.price-formula")
    .findOne({
      where: { id: formulaID },
      select: ["expression"],
    });

  if (!formula?.expression) {
    strapi.log.warn("No expression found for formula ID:", formulaID);
    return;
  }

  const variables = extractPriceVars(data.price_variables);
  if (!variables) {
    strapi.log.warn("No valid price variables provided.");
    return;
  }

  try {
    const finalPrice = evaluate(formula.expression, { ...variables });
    return Number(finalPrice);
  } catch (e) {
    strapi.log.error("Evaluation failed:", e.message);
    return;
  }
}
