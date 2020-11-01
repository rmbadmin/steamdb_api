/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    fastify.route({
        method: 'GET',
        url: '/size',
        schema: {
            tags: ['DB'],
            response: {
                200: {
                    size: {
                        type: 'number'
                    },
                    formatted: {
                        type: 'string'
                    }
                }
            }
        },
        handler: async (req, res) => {
            res.type('application/json').send(`{"size":${await fastify.redis.get('STEAMDB:MEM')},"formatted":"${await fastify.redis.get('STEAMDB:MEM:FORMATTED')}"}`)
        }
    })
    fastify.route({
        method: 'GET',
        url: '/keys',
        schema: {
            tags: ['DB'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        keys: {
                            type: 'number'
                        },
                        formatted: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        handler: async (req, res) => {
            res.type('application/json').send(`{"keys":${await fastify.redis.get('STEAMDB:KEYS')},"formatted":"${await fastify.redis.get('STEAMDB:KEYS:FORMATTED')}"}`)
        }
    })
    next()
}