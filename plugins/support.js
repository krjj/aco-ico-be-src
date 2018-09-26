'use strict'

const fp = require('fastify-plugin')
const level = require('level')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(function (fastify, opts, next) {
  fastify.decorate('verifyJWT', async function (request, reply, done) {
    // your validation logic
    try {
      await request.jwtVerify()
      done()
    } catch (err) {
      done(err)
    }
  })

  var db = level('./level')

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