'use strict'

const httpError = require('http-errors')
const uuid = require('node-uuid')

module.exports = function (fastify, opts, next) {

  fastify.post('/signup', {
    schema: {
      body: {
        type: 'object',
        properties: {
          firstname: {
            type: 'string',
            minLength: 2
          },
          lastname: {
            type: 'string',
            minLength: 2
          },
          email: {
            type: 'string',
            format: 'email'
          },
          password: {
            type: 'string',
            minLength: 5
          }
        },
        required: ['firstname', 'lastname', 'email', 'password']
      }
    },
    beforeHandler: [],
    handler: function (request, reply) {
      let userid = uuid.v4()
      fastify.level.db.get('krjamdade@gmail.com', function (err, value) {
        if (!err) return reply.send(httpError.BadRequest('User already exists'))
        fastify.level.db.put(request.body.email, JSON.stringify({
          userdata: {
            userid : userid,
            firstname: request.body.firstname,
            lastname: request.body.lastname,
            email: request.body.email,
            password: request.body.password
          }
        }), function (err) {
          if (err) return reply.send(httpError.InternalServerError(''))
          reply.send({
            statusCode: 200,
            error: false,
            message: 'New account created',
            data: {
              userid: userid
            }
          })
        })
      })
    }
  })

  fastify.get('/login', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            minLength: 2
          },
          password: {
            type: 'string',
            minLength: 2
          }
        },
        required: ['email', 'password']
      }
    },
    beforeHandler : [],
    handler: function (request, reply) {
      fastify.level.db.get(request.query.email, function (err, value) {
        if (err) return reply.send(httpError.BadRequest('User not found'))
        let userdata = JSON.parse(value)
        if(request.query.password != userdata.userdata.password) return reply.send(httpError.BadRequest('Incorrect password'))
        delete userdata.userdata.password
        let token = fastify.jwt.sign(userdata.userdata)
        reply.send({
          statusCode: 200,
          error: false,
          message: 'User logged in',
          data: {
            jwttoken: token,
            userdata : userdata.userdata
          }
        })
      })
      
    }
  })


  next()
}

// It you prefer async/await, use the following
//
// module.exports = async function (fastify, opts, next) {
//   fastify.get('/example', async function (request, reply) {
//     return 'this is an example'
//   })
// }