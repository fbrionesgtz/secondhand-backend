const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Product = require("../model/Product");
const User = require("../model/User");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.status(200).json({
        products,
      });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.postProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.satusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const category = req.body.category;
  const productImage = req.file.path.replace("\\", "/");
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product({
    title: title,
    category: category,
    price: price,
    description: description,
    productImage: productImage,
    owner: req.userId,
  });

  product
    .save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.products.push(product);
      return user.save();
    })
    .then((user) => {
      res.status(201).json({
        message: "Product created",
        product,
      });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: "Product fetched",
        product,
      });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.updateProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.satusCode = 422;
    throw error;
  }

  const productId = req.params.productId;
  const title = req.body.title;
  const category = req.body.category;
  const price = req.body.price;
  const description = req.body.description;
  let productImage = req.body.image;

  if (req.file) {
    productImage = req.file.path.replace("\\", "/");
  }

  if (!productImage) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      if (productImage != product.productImage) {
        clearImage(product.productImage);
      }

      product.title = title;
      product.category = category;
      product.price = price;
      product.description = description;
      product.productImage = productImage;

      return product.save();
    })
    .then((product) => {
      res.status(200).json({
        message: "Product updated",
        product,
      });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      if (product.owner !== req.userId) {
        const error = new Error("Not authorized.");
        error.statusCode = 403;
        throw error;
      }

      //Check user login
      clearImage(product.productImage);
      return Product.findByIdAndRemove(productId);
    })
    .then((result) => {
      res.status(200).json({ message: "Product deleted." });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getUserProducts = (req, res, next) => {
  Product.find({ owner: req.userId })
    .then((products) => {
      res.status(200).json({
        products,
      });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getProductOwner = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      return User.findById(product.owner);
    })
    .then((user) => {
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: "Product owner found.",
        owner: {
          profileImage: user.profileImage,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    })
    .catch((err) => {
      if (!err.satusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

const clearImage = (imagePath) => {
  imagePath = path.join(__dirname, "..", imagePath);
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
};
