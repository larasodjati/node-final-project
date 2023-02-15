const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Please provide product name'],
    maxlength: 70
  },
  category: {
    type: String,
    enum: ['Bathbody', 'Fragrance', 'Hair', 'Handfoot', 'Lips', 'Makeup', 'Skincare', 'Vitamin'],
    default: 'skincare'
  },
  opened: {
    type: Date,
    required: [true, '\n Please provide date opened with format: mm-dd-yyyy']
  },
  validity: {
    type: Number,
    required: [true, '\n Please provide validity with number']
  },
  expirationDate: {
    type: Date,
    //required: [true, '\n Please provide exp.date with format: mm-dd-yyyy']
  },
  status: {
    type: String,
    enum: ['new', 'in-use', 'expired'],
    default: 'new'
  },
  createdBy: { // tie the product to the actual user
    type: mongoose.Types.ObjectId,
    ref: 'User', // which model that we are referencing
    required: [true, 'Please provide user']
  }

}, { timestamps: true }) // automatically manage our createdAt and updatedAt in our document

module.exports = mongoose.model('Product', ProductSchema)
