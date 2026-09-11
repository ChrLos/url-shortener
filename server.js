const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')

const ShortUrl = require('./model/shortUrl')
const path = require('path')
const app = express()
require("dotenv").config();

mongoose.connect(process.env.MONGODBURL);

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.resolve('./public')));

app.get('/', async (req, res) => {
  let uuid = crypto.randomUUID()
  
  if (!req.cookies.anonymousUserID) {
    res.cookie("anonymousUserID", crypto.randomUUID())
  }

  uuid = req.cookies.anonymousUserID
  const shortUrls = await ShortUrl.find( {anonymousUserID: uuid} )
  res.render('index', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) => {
  const existingShortUrl = await ShortUrl.findOne( {short: req.body.shortUrl} ).lean()

  if (existingShortUrl) {
    return res.status(409).json({
      warning: true,
      message: "Your Custom ShortURL have been used"
    })
  }
  
  await ShortUrl.create({ 
    full: req.body.fullUrl,
    short: req.body.shortUrl || undefined,
    anonymousUserID: req.cookies.anonymousUserID
  })
  
  res.redirect('/')
})

app.post('/resetDatabase', async (req, res) => {
  const uuid = req.cookies.anonymousUserID

  await ShortUrl.deleteMany( {anonymousUserID: uuid} );
  
  res.redirect('/')
})

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)

  shortUrl.clicks++
  shortUrl.save()

  res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);