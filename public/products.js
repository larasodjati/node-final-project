async function buildProductsTable (productsTable, productsTableHeader, token, message) {
  try {
    const response = await fetch('/api/v1/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()
    const children = [productsTableHeader]
    if (response.status === 200) {
      if (data.count === 0) {
        // productsTable.replaceChildren(...children) // clear this for safety
        return 0
      } else {
        for (let i = 0; i < data.products.length; i++) { // --for each products
          // convert opened and expiration date into user friendly form
          // refers to https://stackoverflow.com/questions/17545708/parse-date-without-timezone-javascript/39209842#39209842

          // Opened
          const openedUTC = new Date(data.products[i].opened)
          const offsetOpened = openedUTC.getTimezoneOffset() * 60000
          data.products[i].opened = new Date(openedUTC.getTime() + offsetOpened).toLocaleDateString()

          // if exp date is not available and only open date and validity available
          // condition 1:  only open date and validity(PAO) available, exp date: use calculationExp
          const calculationExp = new Date(new Date(data.products[i].opened).setMonth(new Date(data.products[i].opened).getMonth() + data.products[i].validity))
          if (data.products[i].expirationDate === null) {
            data.products[i].expirationDate = calculationExp
          }
          // if open date, validity, exp available
          //  condition 2: exp date still far from product validity after open, exp date: use the calculation above
          if (calculationExp < new Date(data.products[i].expirationDate)) {
            data.products[i].expirationDate = calculationExp
          }

          // condition 3: exp date less than product validity afater open, exp date: as input
          if (calculationExp > new Date(data.products[i].expirationDate)) {
            data.products[i].expirationDate = new Date(data.products[i].expirationDate)
          }

          // status change to expiring soon : 7 days before exp date
          const oneWeek = new Date(new Date(data.products[i].expirationDate).setDate(new Date(data.products[i].expirationDate).getDate() - 7))
          if (oneWeek < new Date()) {
            data.products[i].status = 'expiring soon'
          }

          // if today passed the expiration date/today is the expiration date, the status of product will change automatically to expired
          if (new Date() >= new Date(data.products[i].expirationDate)) {
            data.products[i].status = 'expired'
          }

          // Expiration Date
          const expiredUTC = new Date(data.products[i].expirationDate)
          const offsetExpired = expiredUTC.getTimezoneOffset() * 60000
          data.products[i].expirationDate = new Date(expiredUTC.getTime() + offsetExpired).toLocaleDateString()

          const editButton = `<td><button type="button" class="editButton" data-id=${data.products[i]._id}>edit</button></td>`
          const deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.products[i]._id}>delete</button></td>`
          const rowHTML = `<td>${data.products[i].brand}</td><td>${data.products[i].category}</td><td>${data.products[i].opened}</td>
            <td>${data.products[i].validity}</td><td>${data.products[i].expirationDate}</td><td>${data.products[i].status}</td>${editButton}${deleteButton}`
          const rowEntry = document.createElement('tr')
          rowEntry.innerHTML = rowHTML
          children.push(rowEntry)

          // change font color for whole row when product expired / expiring soon
          if (data.products[i].status === 'expired') {
            rowEntry.style.color = '#D41E00'
          }

          if (data.products[i].status === 'expiring soon') {
            rowEntry.style.color = '#F5631A'
          }
        }
        productsTable.replaceChildren(...children)
      }
      return data.count
    } else {
      message.textContent = data.msg
      return 0
    }
  } catch (err) {
    message.textContent = 'A communication error occurred.'
    console.log(err)
    return 0
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const logoff = document.getElementById('logoff')
  const message = document.getElementById('message')
  const logonRegister = document.getElementById('logon-register')
  const logon = document.getElementById('logon')
  const register = document.getElementById('register')
  const logonDiv = document.getElementById('logon-div')
  const email = document.getElementById('email')
  const password = document.getElementById('password')
  const logonButton = document.getElementById('logon-button')
  const logonCancel = document.getElementById('logon-cancel')
  const registerDiv = document.getElementById('register-div')
  const name = document.getElementById('name')
  const email1 = document.getElementById('email1')
  const password1 = document.getElementById('password1')
  const password2 = document.getElementById('password2')
  const registerButton = document.getElementById('register-button')
  const registerCancel = document.getElementById('register-cancel')
  const products = document.getElementById('products')
  const productsTable = document.getElementById('products-table')
  const productsTableHeader = document.getElementById('products-table-header')
  const addProduct = document.getElementById('add-product')
  const editProduct = document.getElementById('edit-product')
  const brand = document.getElementById('brand')
  const category = document.getElementById('category')
  const opened = document.getElementById('opened')
  const validity = document.getElementById('validity')
  const expirationDate = document.getElementById('expirationDate')
  const status = document.getElementById('status')
  const addingProduct = document.getElementById('adding-product')
  const productsMessage = document.getElementById('products-message')
  const editCancel = document.getElementById('edit-cancel')
  const deleteAccount = document.getElementById('delete-account')
  const h1 = document.querySelector('h1')
  const tableInformation = document.getElementById('table-information')

  // display
  let showing = logonRegister
  let token = null

  document.addEventListener('startDisplay', async () => {
    showing = logonRegister
    token = localStorage.getItem('token')

    if (token) {
      // if the user is logged in
      h1.innerText = 'Product List'
      logoff.style.display = 'block'
      deleteAccount.style.display = 'block'
      const count = await buildProductsTable(
        productsTable,
        productsTableHeader,
        token,
        message
      )
      if (count > 0) {
        productsMessage.textContent = ''
        productsTable.style.display = 'block'
        tableInformation.style.display = 'block'
      } else {
        productsMessage.textContent = 'There are no products to display for this user.'
        productsTable.style.display = 'none'
        tableInformation.style.display = 'none'
      }
      products.style.display = 'block'
      showing = products
    } else {
      logonRegister.style.display = 'block'
    }
  })

  let thisEvent = new Event('startDisplay')
  document.dispatchEvent(thisEvent)
  let suspendInput = false

  // click function
  document.addEventListener('click', async (e) => {
    if (suspendInput) {
      return // we don't want to act on buttons while doing async operations
    }
    if (e.target.nodeName === 'BUTTON') {
      message.textContent = ''
    }
    if (e.target === logoff) {
      localStorage.removeItem('token')
      token = null
      showing.style.display = 'none'
      logonRegister.style.display = 'block'
      showing = logonRegister
      productsTable.replaceChildren(productsTableHeader) // don't want other users to see
      h1.innerText = 'My Beauty Tracker'
      message.textContent = 'You are logged off.'
      logoff.style.display = 'none'
      deleteAccount.style.display = 'none'
      tableInformation.style.display = 'none'
    } else if (e.target === logon) {
      showing.style.display = 'none'
      logonDiv.style.display = 'block'
      showing = logonDiv
    } else if (e.target === register) {
      showing.style.display = 'none'
      registerDiv.style.display = 'block'
      showing = registerDiv
    } else if (e.target === logonCancel || e.target === registerCancel) {
      showing.style.display = 'none'
      logonRegister.style.display = 'block'
      showing = logonRegister
      email.value = ''
      password.value = ''
      name.value = ''
      email1.value = ''
      password1.value = ''
      password2.value = ''
    } else if (e.target === logonButton) {
      suspendInput = true
      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value
          })
        })
        const data = await response.json()
        if (response.status === 200) {
          message.textContent = `Logon successful.  Welcome ${data.user.name}!`
          token = data.token
          localStorage.setItem('token', token)
          showing.style.display = 'none'
          thisEvent = new Event('startDisplay')
          email.value = ''
          password.value = ''
          document.dispatchEvent(thisEvent)
        } else {
          message.textContent = data.msg
        }
      } catch (err) {
        message.textContent = 'A communications error occurred.'
      }
      suspendInput = false
    } else if (e.target === registerButton) {
      if (password1.value !== password2.value) {
        message.textContent = 'The passwords entered do not match.'
      } else {
        // console.log('add line 236')
        suspendInput = true
        try {
          const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: name.value,
              email: email1.value,
              password: password1.value
            })
          })
          const data = await response.json()
          if (response.status === 201) {
            message.textContent = `Registration successful.  Welcome ${data.user.name}!`
            token = data.token
            localStorage.setItem('token', token)
            // console.log('token after register', token)
            showing.style.display = 'none'
            thisEvent = new Event('startDisplay')
            document.dispatchEvent(thisEvent)
            name.value = ''
            email1.value = ''
            password1.value = ''
            password2.value = ''
          } else {
            message.textContent = data.msg
          }
        } catch (err) {
          message.textContent = 'A communications error occurred.'
        }
        suspendInput = false
      }
      // add delete account
    } else if (e.target === deleteAccount) {
      suspendInput = true
      try {
        deleteAccount.style.display = 'none'
        tableInformation.style.display = 'none'
        logoff.style.display = 'none'

        // console.log('token before delete', token)
        const response = await fetch('/api/v1/user/delete', {

          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        // console.log('token after delete', token)
        const data = await response.json()
        if (response.status === 200) {
          h1.innerText = 'My Beauty Tracker'
          localStorage.removeItem('token')
          token = null
          showing.style.display = 'none'
          logonRegister.style.display = 'block'
          showing = logonRegister
          productsTable.replaceChildren(productsTableHeader)
          message.textContent = 'The user was successfully deleted.'
        } else if (e.target === logon) {
          showing.style.display = 'none'
          logonDiv.style.display = 'block'
          showing = logonDiv
        } else if (e.target === register) {
          showing.style.display = 'none'
          registerDiv.style.display = 'block'
          showing = registerDiv
        } else if (e.target === logonCancel || e.target === registerCancel) {
          showing.style.display = 'none'
          logonRegister.style.display = 'block'
          showing = logonRegister
          email.value = ''
          password.value = ''
          name.value = ''
          email1.value = ''
          password1.value = ''
          password2.value = ''
        } else {
          message.textContent = data.msg
        }
      } catch (err) {
        message.textContent = 'A communication error has occured.'
      }
      suspendInput = false
      // adding product
    } else if (e.target === addProduct) {
      showing.style.display = 'none'
      editProduct.style.display = 'block'
      showing = editProduct
      delete editProduct.dataset.id
      brand.value = ''
      category.value = 'Skincare'
      opened.value = ''
      validity.value = ''
      expirationDate.value = ''
      status.value = 'new'
      addingProduct.textContent = 'add'
      tableInformation.style.display = 'none'
      deleteAccount.style.display = 'none'
    } else if (e.target === editCancel) {
      showing.style.display = 'none'
      brand.value = ''
      category.value = 'Skincare'
      opened.value = ''
      validity.value = ''
      expirationDate.value = ''
      status.value = 'new'
      thisEvent = new Event('startDisplay')
      document.dispatchEvent(thisEvent)
    } else if (e.target === addingProduct) {
      if (!editProduct.dataset.id) {
        // this is an attempted add
        suspendInput = true
        try {
          const response = await fetch('/api/v1/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              brand: brand.value,
              category: category.value,
              opened: opened.value,
              validity: validity.value,
              expirationDate: expirationDate.value,
              status: status.value
            })
          })
          const data = await response.json()
          if (response.status === 201) {
            // successful create
            message.textContent = 'The product entry was created.'
            showing.style.display = 'none'
            thisEvent = new Event('startDisplay')
            document.dispatchEvent(thisEvent)
            brand.value = ''
            category.value = ''
            opened.value = ''
            validity.value = ''
            expirationDate.value = ''
            status.value = ''
          } else {
            // failure
            message.textContent = data.msg
          }
        } catch (err) {
          message.textContent = 'A communication error occurred.'
        }
        suspendInput = false
      } else {
        // this is an update
        suspendInput = true
        try {
          const productID = editProduct.dataset.id
          const response = await fetch(`/api/v1/products/${productID}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              brand: brand.value,
              category: category.value,
              opened: opened.value,
              validity: validity.value,
              expirationDate: expirationDate.value,
              status: status.value
            })
          })
          const data = await response.json()

          if (response.status === 200) {
            message.textContent = 'The entry was updated.'
            showing.style.display = 'none'
            brand.value = ''
            category.value = ''
            opened.value = ''
            validity.value = ''
            expirationDate.value = ''
            status.value = ''
            thisEvent = new Event('startDisplay')
            document.dispatchEvent(thisEvent)
          } else {
            message.textContent = data.msg
          }
        } catch (err) {
          message.textContent = 'A communication error occurred.'
        }
      }
      suspendInput = false
      // edit product
    } else if (e.target.classList.contains('editButton')) {
      deleteAccount.style.display = 'none'
      tableInformation.style.display = 'none'
      editProduct.dataset.id = e.target.dataset.id
      suspendInput = true
      try {
        const response = await fetch(`/api/v1/products/${e.target.dataset.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (response.status === 200) {
          brand.value = data.product.brand
          category.value = data.product.category
          opened.value = data.product.opened
          validity.value = data.product.validity
          expirationDate.value = data.product.expirationDate
          status.value = data.product.status
          showing.style.display = 'none'
          showing = editProduct
          showing.style.display = 'block'
          addingProduct.textContent = 'update'
          message.textContent = ''
        } else {
          // might happen if the list has been updated since last display
          message.textContent = 'The products entry was not found'
          thisEvent = new Event('startDisplay')
          document.dispatchEvent(thisEvent)
        }
      } catch (err) {
        message.textContent = 'A communications error has occurred.'
      }

      suspendInput = false
      // delete product
    } else if (e.target.classList.contains('deleteButton')) {
      suspendInput = true
      try {
        const productID = e.target.dataset.id
        const response = await fetch(`/api/v1/products/${productID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        if (response.status === 200) {
          message.textContent = 'The product was successfully deleted'
          showing.style.display = 'none'
          addingProduct.textContent = 'update'
          thisEvent = new Event('startDisplay')
          document.dispatchEvent(thisEvent)
        } else {
          message.textContent = 'The products entry was not found'
        }
      } catch (err) {
        message.textContent = 'A communications error has occurred.'
      }
      suspendInput = false
    }
  })
})
