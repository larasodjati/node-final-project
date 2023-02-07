function capitalizeProductName (brand) {
  const words = brand.split(' ')
  return words
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase())
    .join(' ')
}

function capitalizeProductCategory (category) {
  const words = category.split(' ')
  return words
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase())
    .join(' ')
}
module.exports = { capitalizeProductName, capitalizeProductCategory }
