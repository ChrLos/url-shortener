require("dotenv").config();
const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./model/shortUrl')
const app = express()

mongoose.connect(process.env.MONGODBURL);

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname));

app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find()
  res.render('index', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) => {
  await ShortUrl.create({ 
    full: req.body.fullUrl,
    short: req.body.shortUrl || undefined
  })
  
  res.redirect('/')
})

app.post('/resetDatabase', async (req, res) => {
  await mongoose.connection.dropDatabase();
  
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