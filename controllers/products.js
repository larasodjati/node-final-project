const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { capitalizeProductName, capitalizeProductCategory } = require('../utils/capitalize')

const getAllProducts = async (req, res) => {
  // // adding pagination
  // const { page = 1, limit = 5 } = req.query
  // // get total docs
  // const total = await Product.countDocuments()
  // // sort products alphabetical
  // const sort = { brand: 1 }
  // const products = await Product.find({ createdBy: req.user.userId }).sort(sort)
  //   .limit(limit * 1)
  //   .skip((page - 1) * limit)
  // // return res with products, total pages, and current page
  // res.status(StatusCodes.OK).json({
  //   products,
  //   count: products.length,
  //   totalPages: Math.ceil(total / limit),
  //   currentPage: page
  // })
  const sort = { brand: 1 }
  const products = await Product.find({ createdBy: req.user.userId }).sort(sort)
  res.status(StatusCodes.OK).json({ products, count: products.length })
}

const getProduct = async (req, res) => {
  const {
    user: { userId },
    params: { id: productId }
  } = req

  const product = await Product.findOne({
    _id: productId,
    createdBy: userId
  })
  if (!product) {
    throw new NotFoundError(`No product with id ${productId}`)
  }
  res.status(StatusCodes.OK).json({ product })
}

const createProduct = async (req, res) => {
  req.body.createdBy = req.user.userId
  req.body.brand = capitalizeProductName(req.body.brand)
  req.body.category = capitalizeProductCategory(req.body.category)

  const product = await Product.create(req.body)
  res.status(StatusCodes.CREATED).json({ product })
}
const updateProduct = async (req, res) => {
  const {
    body: { brand, category, opened, validity, expirationDate },
    user: { userId },
    params: { id: productId }
  } = req

  req.body.brand = capitalizeProductName(req.body.brand)
  req.body.category = capitalizeProductCategory(req.body.category)

  if (brand === '' || category === '' || opened === '' || validity === '' || expirationDate === '') {
    throw new BadRequestError('Brand, Category, Opened, Validity, and Expiration Date fields cannot be empty')
  }
  const product = await Product.findByIdAndUpdate({ _id: productId, createdBy: userId }, req.body, {
    new: true,
    runValidators: true
  })

  if (!product) {
    throw new NotFoundError(`No product with id ${productId}`)
  }
  res.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async (req, res) => {
  const {
    user: { userId },
    params: { id: productId }
  } = req

  const product = await Product.findByIdAndRemove({
    _id: productId,
    createdBy: userId
  })

  if (!product) {
    throw new NotFoundError(`No product with id ${productId}`)
  }
  res.status(StatusCodes.OK).json({ msg: 'The entry was deleted' })
}

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
}
