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

app.use(require('./routes/auth'));

app.use('/api/*', require('./lib/bearer-auth-middleware'));
app.use(require('./routes/gallery-route'));

app.use(require('./lib/error-middleware'));

const PORT = process.env.PORT;
if (!module.parent){
  if (!PORT){
    throw new Error('Forgot to specify PORT');
  }
  app.listen(PORT,function(){
    debug(`Listening on PORT ${PORT}`);
  });
}

module.exports = app;
