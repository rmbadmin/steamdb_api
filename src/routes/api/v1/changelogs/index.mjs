/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    fastify.route({
        method: 'GET',
        url: '/:id',
        schema: {
            tags: ['Changelogs'],
            params: {
                id: {
                    type: 'string'
                }
            },
            response: {
                200: {
                    apps: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example: 'changelog.id'
                        }
                    },
                    count: {
                        type: 'number',
                        example: 1
                    }
                }
            }
        },
        handler: async (req, res) => {
            var apps = [...new Set((await fastify.redis.scan(0, 'MATCH', `changelog:app:*:${req.params.id}`, 'COUNT', 99999999))[1].map(e => e.match(new RegExp(`changelog:app:([0-9]{0,100}):${req.params.id}`))[1]).sort((a, b) => Number(a) - Number(b)))]
            var packages = [...new Set((await fastify.redis.scan(0, 'MATCH', `changelog:package:*:${req.params.id}`, 'COUNT', 99999999))[1].map(e => e.match(new RegExp(`changelog:package:([0-9]{0,100}):${req.params.id}`))[1]).sort((a, b) => Number(a) - Number(b)))]
            res.send({
                apps,
                packages
            })
        }
    })
    next()
}