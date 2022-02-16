var mongoose = require('mongoose')
// require('@mongoosejs/double')

var paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Users',
    },
    subscriptionid: {
      type: mongoose.SchemaTypes.ObjectId
    },
    orderId: {
      type: String,
      required: [true, 'Order Id is required'],
    },
    paymentId: {
      type: String,
      required: [true, 'Payment Id is required'],
    },
    date: {
      type: Date,
      default: new Date(),
    },
    amount: {
      type: Number,
      default: null,
      required: [true, 'Amount is required'],
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Payments = mongoose.model('Payments', paymentSchema)
module.exports = Payments