const puppeteer = require('puppeteer')
require('dotenv').config()
const chai = require('chai')
const { app } = require('../app')

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

chai.should();

(async () => {
  describe('Functional Tests with Puppeteer', function () {
    let browser = null
    let page = null
    before(async function () {
      this.timeout(5000)
      browser = await puppeteer.launch()
      page = await browser.newPage()
      await page.goto('http://localhost:3000')
    })
    after(async function () {
      this.timeout(5000)
      await browser.close()
    })
    describe('got to site', function () {
      it('should have completed a connection', function (done) {
        done()
      })
    })
    describe('login form', function () {
      this.timeout(5000)
      it('should have various elements', async function () {
        this.emailField = await page.$('#email')
        this.emailField.should.not.equal(null)
        this.passwordField = await page.$('#password')
        this.passwordField.should.not.equal(null)
        this.resultHandle = await page.$('#message')
        this.resultHandle.should.not.equal(null)
        this.logon = await page.$('#logon')
        this.logon.should.not.equal(null)
      })
      it('should not login without valid email and password', async function () {
        await this.emailField.type('hello@gmail.com')
        await page.$eval('#password', (el) => (el.value = ''))
        await this.logon.click()
        await sleep(200)
        const resultData = await (
          await this.resultHandle.getProperty('textContent')
        ).jsonValue()
        resultData.should.include('')
      })
    })
  })
})()
