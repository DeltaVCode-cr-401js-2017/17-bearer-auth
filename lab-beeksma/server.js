'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const debug = require('debug')('app:server');

require('dotenv').load();

const app = express();

require('./lib/mongoose-connect');

app.use(morgan('dev'));
app.use(cors());

app.use(require('./route/auth'));
app.use(require('./route/gallery-route'));

app.use(require('./lib/error-middleware'));

const PORT = process.env.PORT;
if (!PORT){
  throw new Error('You forgot your .env!');
}
if(!module.parent){
  app.listen(PORT, () => {
    debug(`listening on ${PORT}`);
  });
}

module.exports = app;
