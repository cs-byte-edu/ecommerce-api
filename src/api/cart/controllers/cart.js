"use strict";

/**
 * cart controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const getProduct = async (productId) => {
  return strapi.documents("api::product.product").findOne({
    documentId: productId,
  });
};

const getUserCart = async (userId) => {
  const carts = await strapi.documents("api::cart.cart").findMany({
    filters: {
      users_permissions_user: {
        documentId: userId,
      },
    },
    populate: {
      cart_items: {
        populate: {
          product: true,
        },
      },
    },
  });

  return carts?.length > 0 ? carts[0] : null;
};

const MESSAGES = {
  PRODUCT_ID_REQUIRED: "Product documentId is required",
  PRODUCT_NOT_FOUND: "Product not found",
  INSUFFICIENT_STOCK: "Sorry, we don't have enough stock at the moment",
  CART_ERROR: "Error adding to cart",
  CART_NOT_FOUND: "Cart not found",
  CART_ITEM_NOT_FOUND: "Cart item not found",
  CART_ITEM_REMOVED: "Item removed from cart",
  QUANTITY_NEGATIVE_VALUE: "The quantity cannot be negative",
};

module.exports = createCoreController("api::cart.cart", ({ strapi }) => ({
  async getCart(ctx) {
    try {
      const userId = ctx.state.user.documentId;

      const cart = await strapi.documents("api::cart.cart").findMany({
        filters: {
          users_permissions_user: {
            documentId: userId,
          },
        },
        populate: {
          cart_items: {
            populate: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.length === 0) {
        return ctx.send({
          cart_items: [],
          total: 0,
          itemsCount: 0,
        });
      }

      const cartData = cart[0];

      const total = cartData.cart_items.reduce(
        (acc, curr) => acc + curr.price_at_time * curr.quantity,
        0
      );

      const itemsCount = cartData.cart_items.reduce(
        (acc, curr) => acc + curr.quantity,
        0
      );

      ctx.send({
        cart_items: cartData.cart_items,
        total: total,
        itemsCount: itemsCount,
      });
    } catch (error) {
      ctx.throw(500, `Failed to retrieve the cart: ${error.message}`);
    }
  },

  async addToCart(ctx) {
    try {
      const userId = ctx.state.user.documentId;
      const { productId, quantity = 1 } = ctx.request.body;

      if (!productId) {
        return ctx.badRequest(MESSAGES.PRODUCT_ID_REQUIRED);
      }

      const product = await getProduct(productId);

      if (!product) {
        return ctx.notFound(MESSAGES.PRODUCT_NOT_FOUND);
      }

      if (product.stockQuantity < quantity) {
        return ctx.badRequest(MESSAGES.INSUFFICIENT_STOCK);
      }

      let cart = await getUserCart(userId);

      if (!cart) {
        cart = await strapi.documents("api::cart.cart").create({
          data: {
            users_permissions_user: {
              documentId: userId,
            },
            cart_items: [],
          },
        });
      }

      const existingCartItem = await strapi
        .documents("api::cart-item.cart-item")
        .findMany({
          filters: {
            cart: {
              documentId: cart.documentId,
            },
            product: {
              documentId: productId,
            },
          },
          populate: ["cart", "product"],
        });

      if (existingCartItem && existingCartItem.length > 0) {
        const newProductQuantity = existingCartItem[0].quantity + quantity;

        if (product.stockQuantity < newProductQuantity) {
          return ctx.badRequest(MESSAGES.INSUFFICIENT_STOCK);
        }

        const updateDocuments = await strapi
          .documents("api::cart-item.cart-item")
          .update({
            documentId: existingCartItem[0].documentId,
            data: {
              quantity: newProductQuantity,
            },
          });
      } else {
        const cartItem = await strapi
          .documents("api::cart-item.cart-item")
          .create({
            data: {
              cart: cart.documentId,
              product: product.documentId,
              quantity: quantity,
              price_at_time: product.price,
            },
          });
      }

      const updatedCart = await getUserCart(userId);

      ctx.send({
        updatedCart,
      });
    } catch (error) {
      ctx.throw(500, `Error adding to cart: ${error.message}`);
    }
  },

  async updateItemQuantity(ctx) {
    try {
      const userId = ctx.state.user.documentId;
      const { productId, quantity } = ctx.request.body;

      if (!productId) {
        return ctx.badRequest(MESSAGES.PRODUCT_ID_REQUIRED);
      }

      if (quantity < 0) {
        return ctx.badRequest(MESSAGES.QUANTITY_NEGATIVE_VALUE);
      }

      const cart = await getUserCart(userId);

      if (!cart) {
        return ctx.notFound(MESSAGES.CART_ITEM_NOT_FOUND);
      }

      const cartItems = await strapi
        .documents("api::cart-item.cart-item")
        .findMany({
          filters: {
            cart: { documentId: cart.documentId },
            product: { documentId: productId },
          },
          populate: { product: true },
        });

      if (!cartItems || cartItems.length === 0) {
        return ctx.notFound(MESSAGES.CART_ITEM_NOT_FOUND);
      }

      const cartItem = cartItems[0];

      if (quantity === 0) {
        await strapi.entityService.delete(
          "api::cart-item.cart-item",
          cartItem.id
        );
        return ctx.send({ message: MESSAGES.CART_ITEM_REMOVED });
      }

      if (cartItem.product.stockQuantity < quantity) {
        return ctx.badRequest(MESSAGES.INSUFFICIENT_STOCK);
      }

      const updatedCartItems = await strapi
        .documents("api::cart-item.cart-item")
        .update({
          documentId: cartItem.documentId,
          data: {
            quantity: quantity,
          },
        });

      const updatedCart = await getUserCart(userId);

      ctx.send({
        updatedCart,
        message: "Quantity updated",
      });
    } catch (error) {
      ctx.throw(500, `Cart update error: ${error.message}`);
    }
  },

  async clearCart(ctx) {
    try {
      const userId = ctx.state.user.documentId;

      const cart = await getUserCart(userId);

      if (!cart) {
        return ctx.send({
          message: "Cart is already empty",
        });
      }

      if (cart.cart_items && cart.cart_items.length > 0) {
        for (const item of cart.cart_items) {
          await strapi.documents("api::cart-item.cart-item").delete({
            documentId: item.documentId,
          });
        }
      }

      return ctx.send({
        message: "Cart cleared",
        cartId: cart.documentId,
      });
    } catch (error) {
      strapi.log.error("Error clearing shopping cart:", error);
      return ctx.internalServerError("Помилка сервера");
    }
  },

  async removeCartItem(ctx) {
    try {
      const userId = ctx.state.user.documentId;

      const { productId } = ctx.params;

      const cart = await getUserCart(userId);

      if (!cart) {
        return ctx.notFound(MESSAGES.CART_NOT_FOUND);
      }

      const itemExists = cart.cart_items?.some(
        (item) => item.documentId === productId
      );

      if (!itemExists) {
        return ctx.notFound(MESSAGES.CART_ITEM_NOT_FOUND);
      }

      await strapi.documents("api::cart-item.cart-item").delete({
        documentId: productId,
      });

      const updatedCartItems = cart.cart_items
        .filter((item) => item.documentId !== productId)
        .map((item) => item.documentId);

      await strapi.documents("api::cart.cart").update({
        documentId: cart.documentId,
        data: {
          cart_items: updatedCartItems,
        },
      });

      return ctx.send({
        success: true,
        message: MESSAGES.CART_ITEM_REMOVED,
      });
    } catch (error) {
      strapi.log.error("Помилка видалення товару:", error);
      return ctx.internalServerError("Помилка сервера");
    }
  },

  async syncGuestCart(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { guestCartItems } = ctx.request.body;

      console.log("guestCartItems: ", guestCartItems);

      if (!guestCartItems || !Array.isArray(guestCartItems)) {
        return ctx.badRequest("Некоректні дані гостьового кошика");
      }

      let userCart = await strapi.entityService.findMany("api::cart.cart", {
        filters: { users_permissions_user: userId },
        populate: { cart_items: { populate: { product: true } } },
      });

      console.log("sync:  userCart : ", userCart);

      if (!userCart || userCart.length === 0) {
        userCart = await strapi.entityService.create("api::cart.cart", {
          data: {
            users_permissions_user: userId,
            cart_items: [],
          },
        });
        userCart = { ...userCart, cart_items: [] };
      } else {
        userCart = userCart[0];
      }

      const syncResults = [];

      for (const guestItem of guestCartItems) {
        const { productId, quantity } = guestItem;

        const product = await strapi.documents("api::product.product").findOne({
          documentId: productId,
        });

        console.log("PRODUCT: ", product);
        console.log("ENTITY  productId: ", productId);

        if (!product) {
          syncResults.push({
            productId,
            status: "error",
            message: "Товар не знайдено",
          });
          continue;
        }

        console.log("userCart.cart_items: ", userCart.cart_items);

        const existingItem = userCart.cart_items.find(
          (item) => item.product.documentId === productId
        );

        console.log("EXIST: ", existingItem);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;

          if (product.stockQuantity >= newQuantity) {
            await strapi.documents("api::cart-item.cart-item").update({
              documentId: existingItem.documentId,
              data: {
                quantity: newQuantity,
              },
            });

            syncResults.push({
              productId,
              status: "merged",
              message: "Кількість збільшено",
            });
          } else {
            syncResults.push({
              productId,
              status: "partial",
              message: "Додано максимально можливу кількість",
            });

            await strapi.documents("api::cart-item.cart-item").update({
              documentId: existingItem.documentId,
              data: {
                quantity: product.stockQuantity,
              },
            });
          }
        } else {
          console.log("COUNT: ", product.stockQuantity);
          if (product.stockQuantity >= quantity) {
            await strapi.entityService.create("api::cart-item.cart-item", {
              data: {
                cart: userCart.id,
                product: productId,
                quantity: quantity,
              },
            });
            syncResults.push({
              productId,
              status: "added",
              message: "Товар додано",
            });
          } else {
            syncResults.push({
              productId,
              status: "error",
              message: MESSAGES.INSUFFICIENT_STOCK,
            });
          }
        }
      }

      ctx.send({
        message: "Синхронізація завершена",
        results: syncResults,
      });
    } catch (error) {
      ctx.throw(500, `Помилка синхронізації: ${error.message}`);
    }
  },
}));
