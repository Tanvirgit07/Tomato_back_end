const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    products: [
        {type: String,required: true},
        {quantity: Number, required: true}
    ],
    email: {
        type: String
    },
    amount: {
        type: Number
    }, 
    status: {
        type: String,
        enum: ['pending', 'processing','shipped','completed'],
        default: "pending"
    }
},{timestamps: true})


const PaymentModal = mongoose.model('payment', paymentSchema);
module.exports = PaymentModal