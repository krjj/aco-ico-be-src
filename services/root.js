'use strict'

module.exports = function (fastify, opts, next) {
  fastify.get('/', function (request, reply) {
    reply.send({ "status" : 'OK' , message : 'Service is operational'})
  })

  next()
}

// It you prefer async/await, use the following
//
// module.exports = async function (fastify, opts, next) {
//   fastify.get('/', async function (request, reply) {
//     return { root: true }
//   })
// }
