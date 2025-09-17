const cloudinary = require("../../cloudinary/cloudinaryConfig");
const FoodModel = require("../../models/foodModel/foodModel");
const OfferModel = require("../../models/offerModel/offerModel");

const createOffer = async (req, res) => {
    console.log('ame')
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

   
    if (!title || !discountPercentage || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Offer image is required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "offers",
    });

    console.log(req.user)

    // Create new offer
    const newOffer = new OfferModel({
      title,
      description,
      image: result.secure_url,
      discountPercentage,
      startDate,
      endDate,
      offerType,
      createdBy: req.user.id,
    });

    await newOffer.save();

    // Update each product with this offer
    if (products && products.length > 0) {
      for (const productId of products) {
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

    res.status(201).json({ success: true, message: "Offer created successfully", data: newOffer });
  } catch (error) {
    console.error("Offer create error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

module.exports = { createOffer };
