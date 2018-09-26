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
      fastify.level.db.get(request.body.email, function (err, value) {
        if (!err) return reply.send(httpError.BadRequest('User already exists'))
        fastify.level.db.put(request.body.email, JSON.stringify({
          userdata: {
            userid: userid,
            firstname: request.body.firstname,
            lastname: request.body.lastname,
            email: request.body.email,
            password: request.body.password,
            userEthAddress: '',
            bio : {
              dob : { 
                dd : '1',
                mm : '01',
                yyyy : '2000'
              },
              address : {
                line : '--',
                country : '--',
                city : '--',
                postalcode : '--'
              }
            }
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
    beforeHandler: [],
    handler: function (request, reply) {
      fastify.level.db.get(request.query.email, function (err, value) {
        if (err) return reply.send(httpError.BadRequest('User not found'))
        let userdata = JSON.parse(value)
        if (request.query.password != userdata.userdata.password) return reply.send(httpError.BadRequest('Incorrect password'))
        delete userdata.userdata.password
        let token = fastify.jwt.sign(userdata.userdata)
        reply.send({
          statusCode: 200,
          error: false,
          message: 'User logged in',
          data: {
            jwttoken: token,
            userdata: userdata.userdata
          }
        })
      })

    }
  })

  fastify.get('/userEthAddress', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            minLength: 2
          }
        },
        required: ['email']
      }
    },
    beforeHandler: fastify.auth([fastify.verifyJWT]),
    handler: function (request, reply) {
      fastify.level.db.get(request.query.email, function (err, value) {
        if (err) return reply.send(httpError.BadRequest('User not found'))
        let userdata = JSON.parse(value)
        reply.send({
          statusCode: 200,
          error: false,
          message: 'Eth Address',
          data: {
            userEthAddress: userdata.userdata.userEthAddress || ''
          }
        })
      })

    }
  })

  fastify.post('/userEthAddress', {
    schema: {
      body: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            minLength: 2
          },
          userEthAddress: {
            type: 'string',
            minLength: 20
          }
        },
        required: ['email','userEthAddress']
      }
    },
    beforeHandler: fastify.auth([fastify.verifyJWT]),
    handler: function (request, reply) {
      fastify.level.db.get(request.body.email, function (err, value) {
        if (err) return reply.send(httpError.BadRequest('User not found'))
        let userdata = JSON.parse(value)
        console.log(request.body)
        userdata.userdata.userEthAddress =  request.body.userEthAddress
        fastify.level.db.put(request.body.email, JSON.stringify({
          userdata: userdata.userdata
        }), function (err) {
          if (err) return reply.send(httpError.InternalServerError(''))
          reply.send({
            statusCode: 200,
            error: false,
            message: 'Eth Address updated',
            data: {
              userEthAddress: request.body.userEthAddress
            }
          })
        })
      })
    }
  })

  fastify.get('/profile', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            minLength: 2
          }
        },
        required: ['email']
      }
    },
    beforeHandler: fastify.auth([fastify.verifyJWT]),
    handler: function (request, reply) {
      fastify.level.db.get(request.query.email, function (err, value) {
        if (err) return reply.send(httpError.BadRequest('User not found'))
        let userdata = JSON.parse(value)
        reply.send({
          statusCode: 200,
          error: false,
          message: 'Eth Address',
          data: {
            profile : userdata.userdata.bio
          }
        })
      })

    }
  })

  fastify.post('/profile', {
    schema: {
      body: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            minLength: 2
          },
          dob_dd: {
            type: 'string'
          },
          dob_mm: {
            type: 'string'
          },
          dob_yyyy: {
            type: 'string'
          },
          address_line: {
            type: 'string'
          },
          address_city: {
            type: 'string'
          },
          address_country: {
            type: 'string'
          },
          address_postalcode: {
            type: 'string'
          }
        },
        required: ['email','dob_dd','dob_mm','dob_yyyy','address_line','address_city','address_country','address_postalcode']
      }
    },
    beforeHandler: fastify.auth([fastify.verifyJWT]),
    handler: function (request, reply) {
      fastify.level.db.get(request.body.email, function (err, value) {
        if (err) return reply.send(httpError.BadRequest('User not found'))
        let userdata = JSON.parse(value)
        userdata.userdata.bio.dob['dd'] =  request.body['dob_dd']
        userdata.userdata.bio.dob['mm'] = request.body['dob_mm']
        userdata.userdata.bio.dob['yyyy'] = request.body['dob_yyyy']
        userdata.userdata.bio.address['line'] = request.body['address_line']
        userdata.userdata.bio.address['city'] =request.body['address_city']
        userdata.userdata.bio.address['country'] =request.body['address_country']
        userdata.userdata.bio.address['postalcode'] = request.body['address_postalcode']
        fastify.level.db.put(request.body.email, JSON.stringify({
          userdata: userdata.userdata
        }), function (err) {
          if (err) return reply.send(httpError.InternalServerError(''))
          reply.send({
            statusCode: 200,
            error: false,
            message: 'Profile Updated',
            data: {
              profile: userdata.userdata.bio
            }
          })
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