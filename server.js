const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()

app.use('/', express.static('public'))

app.listen(3000)