const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const nanoId = require('nanoid')

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
  let anonymousUserID = req.cookies.anonymousUserID

  if (!anonymousUserID) {
    anonymousUserID = nanoId.nanoid()
    res.cookie("anonymousUserID", anonymousUserID, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax'
    })
  }

  const shortUrls = await ShortUrl.find({ anonymousUserID: anonymousUserID })
  res.render('index', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) => {
  try {
    await ShortUrl.create({
      full: req.body.fullUrl,
      short: req.body.shortUrl || undefined,
      anonymousUserID: req.cookies.anonymousUserID
    })
  } catch (err) {
    if (err.code == 11000) {
      return res.status(409).json({
        warning: true,
        message: "Your Custom ShortURL have been used"
      })
    }

    throw err
  }

  res.redirect('/')
})

app.post('/resetDatabase', async (req, res) => {
  await ShortUrl.deleteMany({ anonymousUserID: req.cookies.anonymousUserID });
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