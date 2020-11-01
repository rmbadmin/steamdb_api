/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    fastify.route({
        method: 'GET',
        url: '/:package_id',
        schema: {
            tags: ['Packages'],
            params: {
                type: 'object',
                properties: {
                    package_id: {
                        type: 'string'
                    }
                }
            },
            response: {
                200: {
                    changenumber: {
                        type: 'number'
                    },
                    packageinfo: {
                        type: 'object'
                    }
                }
            }
        },
        handler: async (req, res) => {
            var _package = await fastify.redis.get(`package:${req.params.package_id}:info`)
            if (!_package) return res.callNotFound()
            res.type('application/json').send(`${_package}`)
        }
    })
    fastify.route({
        method: 'GET',
        url: '/:package_id/changelogs',
        schema: {
            tags: ['Packages'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'string',
                        example: 'changelog.id'
                    }
                }
            }
        },
        handler: async (req, res) => {
            var _package = await fastify.redis.get(`package:${req.params.package_id}:info`)
            if (!_package) return res.code(404).send(JSON.stringify({
                message: `Package ID ${req.params.package_id} not found.`
            }))
            var changelogs = (await fastify.redis.scan(0, 'MATCH', `changelog:package:${req.params.package_id}:*`, 'COUNT', 99999999))[1].map(e => e.match(new RegExp(`changelog:package:${req.params.package_id}:([0-9]{0,})`))[1]).sort((a, b) => parseInt(b) - parseInt(a))
            res.send(changelogs)
        }
    })
    fastify.route({
        method: 'GET',
        url: '/:package_id/changelog/:changelog_id',
        schema: {
            tags: ['Packages'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            kind: {
                                type: 'string',
                            },
                            path: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            },
                            lhs: {

                            },
                            rhs: {

                            }
                        }
                    }
                }
            }
        },
        handler: async (req, res) => {
            var changelog = await fastify.redis.get(`changelog:package:${req.params.package_id}:${req.params.changelog_id}`)
            if (!changelog) return res.callNotFound()
            res.type('application/json').send(`${changelog}`)
        }
    })
    next()
}