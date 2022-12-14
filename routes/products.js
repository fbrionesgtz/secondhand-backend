const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const productsController = require("../controllers/products");
const isAuth = require("../middleware/is-auth");

// GET /products/
router.get("/", isAuth, productsController.getProducts);

// POST /products/
router.post(
  "/",
  isAuth,
  [
    body("title").not().isEmpty(),
    body("price").not().isEmpty().isFloat({ min: 0 }),
    body("description").trim().isLength({ min: 30 }),
  ],
  productsController.postProduct
);

router.get("/:productId", isAuth, productsController.getProduct);

router.put(
  "/:productId",
  isAuth,
  [
    body("title").not().isEmpty(),
    body("category").not().isEmpty(),
    body("price").not().isEmpty().isFloat({ min: 0 }),
    body("description").trim().isLength({ min: 30 }),
  ],
  productsController.updateProduct
);

router.delete("/:productId", isAuth, productsController.deleteProduct);

router.get("/owner/:productId", isAuth, productsController.getProductOwner);

module.exports = router;
