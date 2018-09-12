'use strict'

const os = require('os')
const path = require('path')
const fp = require('fastify-plugin')
const level = require('level')
const db = level(os.homedir() + '/level')


// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(function (fastify, opts, next) {

  fastify.decorate('level', {
    db: db
  })
  next()
})

// It you prefer async/await, use the following
//
// module.exports = fp(async function (fastify, opts) {
//   fastify.decorate('someSupport', function () {
//     return 'hugs'
//   })
// })