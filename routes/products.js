const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const productsController = require("../controllers/products");

// GET /products/
router.get("/", productsController.getProducts);

// POST /products/
router.post(
  "/",
  [
    body("title").trim().isLength({ min: 5 }),
    body("description").trim().isLength({ min: 5 }),
  ],
  productsController.postProduct
);

// GET /product/:product
router.get("/:productId", productsController.getProduct);

module.exports = router;
