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

    // Create new offer
    const newOffer = new OfferModel({
      title,
      description,
      image: result.secure_url,
      discountPercentage,
      startDate,
      endDate,
      offerType,
      createdBy: req.user._id, // ✅ now req.user is available
    });

    await newOffer.save();

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
    next(handleError(500, error.message))
  }
};

const editOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params; // route: /editoffer/:offerId
    const {
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      offerType,
      products,
    } = req.body;

    // 1️⃣ Find existing offer
    const existingOffer = await OfferModel.findById(offerId);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // 2️⃣ Update image if new file uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "offers",
      });
      existingOffer.image = result.secure_url;
    }

    // 3️⃣ Update basic fields
    if (title) existingOffer.title = title;
    if (description) existingOffer.description = description;
    if (discountPercentage) existingOffer.discountPercentage = discountPercentage;
    if (startDate) existingOffer.startDate = startDate;
    if (endDate) existingOffer.endDate = endDate;
    if (offerType) existingOffer.offerType = offerType;

    await existingOffer.save();

    // 4️⃣ Handle products update
    let parsedProducts = [];
    if (products) {
      if (typeof products === "string") {
        try {
          parsedProducts = JSON.parse(products);
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

    // Remove offer from previous products
    const oldProducts = await FoodModel.find({ offers: existingOffer._id });
    for (const product of oldProducts) {
      product.offers = product.offers.filter(
        (offerId) => offerId.toString() !== existingOffer._id.toString()
      );
      await product.save();
    }

    // Attach offer to new products & update discountPrice
    if (parsedProducts.length > 0) {
      for (const productId of parsedProducts) {
        const product = await FoodModel.findById(productId);
        if (!product) continue;

        product.offers = product.offers || [];
        if (!product.offers.includes(existingOffer._id)) {
          product.offers.push(existingOffer._id);
        }

        // Update discounted price
        const discountAmount = (product.price * existingOffer.discountPercentage) / 100;
        product.discountPrice = product.price - discountAmount;

        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: existingOffer,
    });
  } catch (error) {
    console.error("Edit Offer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllOffers = async (req, res) => {
  try {
    const offers = await OfferModel.find()
      .populate("createdBy", "name email") // creator এর name ও email
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
      .populate("createdBy", "name email");

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

    const offer = await OfferModel.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // 1️⃣ Remove this offer from all products
    const products = await FoodModel.find({ offers: offer._id });
    for (const product of products) {
      product.offers = product.offers.filter(
        (id) => id.toString() !== offer._id.toString()
      );

      // Optional: remove discountPrice if needed
      product.discountPrice = undefined;

      await product.save();
    }

    // 2️⃣ Delete the offer
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
