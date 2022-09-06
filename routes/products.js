const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const productsController = require("../controllers/products");

// GET /products/
router.get("/", productsController.getProducts);

// POST /products/
router.post(
  "/",
  // [
  //   body("title").trim().isLength({ min: 1 }),
  //   () => {
  //     return body("price") >= 0;
  //   },
  //   () => {
  //     return body("image") ? true : false;
  //   },
  //   body("description").trim().isLength({ min: 30 }),
  // ],
  productsController.postProduct
);

router.get("/:productId", productsController.getProduct);

router.put(
  "/:productId",
  // [
  //   body("title").trim().isLength({ min: 1 }),
  //   () => {
  //     return body("price") >= 0;
  //   },
  //   () => {
  //     return body("image") ? true : false;
  //   },
  //   body("description").trim().isLength({ min: 30 }),
  // ],
  productsController.updateProduct
);

router.delete("/:productId", productsController.deleteProduct);

module.exports = router;
