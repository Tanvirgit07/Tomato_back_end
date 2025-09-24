const cloudinary = require("../../cloudinary/cloudinaryConfig");
const handleError = require("../../helper/handelError/handleError");
const FoodModel = require("../../models/foodModel/foodModel");
const OfferModel = require("../../models/offerModel/offerModel");

const createOffer = async (req, res, next) => {
  try {
    const {
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      offerType,
      products,
    } = req.body;

    // Validation
    if (!title || !discountPercentage || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Offer image is required",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "offers",
    });

    // ===================== Handle Products =====================
    let parsedProducts = [];

    if (products) {
      if (typeof products === "string") {
        try {
          parsedProducts = JSON.parse(products); // "[...]" → real array
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Products must be a valid JSON array",
          });
        }
      } else {
        parsedProducts = products;
      }
    }

    // Create new offer and attach product ids
    const newOffer = new OfferModel({
      title,
      description,
      image: result.secure_url,
      discountPercentage,
      startDate,
      endDate,
      offerType,
      createdBy: req.user._id,
      products: parsedProducts, // ✅ Save product IDs in offer
    });

    await newOffer.save();

    // Update each product with this offer
    if (parsedProducts && parsedProducts.length > 0) {
      for (const productId of parsedProducts) {
        const product = await FoodModel.findById(productId);
        if (!product) continue;

        // Attach offer to product
        product.offers = product.offers || [];
        product.offers.push(newOffer._id);

        // Update discounted price
        const discountAmount = (product.price * discountPercentage) / 100;
        product.discountPrice = product.price - discountAmount;

        await product.save();
      }
    }

    // Response
    res.status(200).json({
      success: true,
      message: "Offer created successfully",
      data: newOffer,
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};


const editOffer = async (req, res, next) => {
  try {
    const offerId = req.params.offerId;
    const {
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      offerType,
      products,
    } = req.body;

    // Validation
    if (!title || discountPercentage === undefined || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // Find existing offer
    const offer = await OfferModel.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Handle Image
    let imageUrl = offer.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "offers",
      });
      imageUrl = result.secure_url;
    }

    // Handle Products safely (fix single product case)
    let parsedProducts = [];
    if (products) {
      if (typeof products === "string") {
        try {
          parsedProducts = JSON.parse(products); // stringified array
          if (!Array.isArray(parsedProducts)) {
            // if single value like "productId", convert to array
            parsedProducts = [parsedProducts];
          }
        } catch (e) {
          // single value string (productId) case
          parsedProducts = [products];
        }
      } else if (Array.isArray(products)) {
        parsedProducts = products;
      } else {
        // single product as object/id
        parsedProducts = [products];
      }
    }

    // Remove offer from old products not in new list
    const oldProducts = offer.products || [];
    for (const oldProductId of oldProducts) {
      if (!parsedProducts.includes(oldProductId.toString())) {
        const oldProduct = await FoodModel.findById(oldProductId);
        if (oldProduct) {
          oldProduct.offers = (oldProduct.offers || []).filter(
            (id) => id.toString() !== offer._id.toString()
          );
          oldProduct.discountPrice = oldProduct.price;
          await oldProduct.save();
        }
      }
    }

    // Update offer fields
    offer.title = title;
    offer.description = description;
    offer.discountPercentage = discountPercentage;
    offer.startDate = startDate;
    offer.endDate = endDate;
    offer.offerType = offerType;
    offer.image = imageUrl;
    offer.products = parsedProducts;
    offer.createdBy = req.user._id;

    await offer.save();

    // Update each product with this offer
    for (const productId of parsedProducts) {
      const product = await FoodModel.findById(productId);
      if (!product) continue;

      product.offers = product.offers || [];
      if (!product.offers.includes(offer._id)) {
        product.offers.push(offer._id);
      }

      const discountAmount = (product.price * discountPercentage) / 100;
      product.discountPrice = product.price - discountAmount;

      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Edit Offer Error:", error);
    next(handleError(500, error.message));
  }
};


const getAllOffers = async (req, res) => {
  try {
    const offers = await OfferModel.find()
      .populate("createdBy", "name email") // Creator এর name ও email
      .populate("products", "name price discountPrice") // Products এর name, price, discountPrice
      .sort({ createdAt: -1 }); // নতুন offers আগে দেখাবে

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error("Get All Offers Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const getSingleOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await OfferModel.findById(offerId)
      .populate("createdBy", "name email") // Creator এর name ও email
      .populate("products", "name price discountPrice"); // Products এর name, price, discountPrice

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Get Single Offer Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    // Find the offer
    const offer = await OfferModel.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Remove this offer from all related products
    if (offer.products && offer.products.length > 0) {
      const products = await FoodModel.find({ _id: { $in: offer.products } });
      for (const product of products) {
        // Remove this offer from product's offers array
        product.offers = (product.offers || []).filter(
          (id) => id.toString() !== offer._id.toString()
        );

        // Recalculate discountPrice if needed
        if (product.offers.length === 0) {
          product.discountPrice = undefined; // No active offer
        } else {
          // Optional: recalc discountPrice based on remaining offers
          // For simplicity, you can leave it undefined or implement logic
        }

        await product.save();
      }
    }

    // Delete the offer
    await OfferModel.findByIdAndDelete(offerId);

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete Offer Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = { createOffer,editOffer,getAllOffers,getSingleOffer,deleteOffer };
