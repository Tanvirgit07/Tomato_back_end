const handleError = require("../../helper/handelError/handleError");
const CartModal = require("../../models/cartModel/cartModel");
const FoodModel = require("../../models/foodModel/foodModel");

const addToCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body; // default quantity = 1

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // check product ase kina
    const product = await FoodModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // check stock (optional, jodi stock field thake)
    if (product.stock && quantity > product.stock) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // check cart e already ase kina
    let cartItem = await CartModal.findOne({ userId, productId });

    if (cartItem) {
      cartItem.quantity += quantity; // add to existing quantity
      await cartItem.save();

      return res.status(200).json({
        success: true,
        message: "Quantity updated!",
        cartItem,
      });
    } else {
      const newItem = new CartModal({
        userId,
        productId,
        quantity,
      });
      await newItem.save();

      return res.status(201).json({
        success: true,
        message: "Product added to cart",
        newItem,
      });
    }
  } catch (err) {
    console.error("Add to cart error:", err);
    return res.status(500).json({ success: false, message: err.message });
    // or use: next(handleError(500, err.message));
  }
};


const updateCartQuantity = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    const { action } = req.body; // "increment" | "decrement"

    let cartItem = await CartModal.findOne({ userId, productId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const product = await FoodModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (action === "increment") {
      if (cartItem.quantity >= product.stock) {
        return res.status(400).json({ message: "Reached stock limit" });
      }
      cartItem.quantity += 1;
    } else if (action === "decrement") {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        await CartModal.findByIdAndDelete(cartItem._id);
        return res.json({ success: true, message: "Item removed from cart" });
      }
    }

    await cartItem.save();

    return res.json({
      success: true,
      message: "Quantity updated",
      cartItem,
    });
  } catch (err) {
    next(handleError(500, err.message))
  }
};

const getCartByuserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const existingitem = await CartModal.find({ userId: userId }).populate(
      "productId"
    );
    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: existingitem,
    });
  } catch (err) {
    next(handleError(500, err.message));
  }
};

// Delete cart item
const deleteCartItem = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "userId and productId are required",
      });
    }

    // Find and delete the cart item
    const deletedItem = await CartModal.findOneAndDelete({
      userId,
      productId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart item deleted successfully",
      data: deletedItem,
    });
  } catch (error) {
    next(handleError(500, error.message))
  }
};


module.exports = { addToCart, getCartByuserId, updateCartQuantity, deleteCartItem };
