'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const fs = require("fs")
module.exports = function (fastify, opts, next) {
  // Place here your custom code!


  //register fastify auth
  fastify.register(require('fastify-auth'))

  //enable cors
  fastify.use(require('cors')())

  //register jwt auth module
  fastify.register(require('fastify-jwt'), { 
    secret: 'supersecret' 
  })
  
  //

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  })

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services')
  })

  // Make sure to call next when done
  next()
}
//fastify server instance options
module.exports.options = {
  https: {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./cert.pem')
  }
}