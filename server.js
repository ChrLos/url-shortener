require("dotenv").config();
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')

const ShortUrl = require('./model/shortUrl')
const path = require('path')
const app = express()

mongoose.connect(process.env.MONGODBURL);

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.resolve('./public')));

app.get('/', async (req, res) => {
  let uuid = crypto.randomUUID()
  
  if (!req.cookies.anonymousUserID) {
    res.cookie("anonymousUserID", uuid)
  } else {
    uuid = req.cookies.anonymousUserID
  }

  const shortUrls = await ShortUrl.find( {anonymousUserID: uuid} )
  res.render('index', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) => {
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