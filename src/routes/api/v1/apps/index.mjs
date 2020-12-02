/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    fastify.route({
        method: 'GET',
        url: '/:app_id',
        schema: {
            tags: ['Apps'],
            params: {
                type: 'object',
                properties: {
                    app_id: {
                        type: 'string'
                    }
                }
            },
            response: {
                200: {
                    changenumber: {
                        type: 'number'
                    },
                    appinfo: {
                        type: 'object'
                    }
                }
            }
        },
        handler: async (req, res) => {
            var app = await fastify.redis.get(`app:${req.params.app_id}:info`)
            if (!app) return res.callNotFound()
            res.type('application/json').send(`${app}`)
        }
    })
    fastify.route({
        method: 'GET',
        url: '/:app_id/changelogs',
        schema: {
            tags: ['Apps'],
            params: {
                type: 'object',
                properties: {
                    app_id: {
                        type: 'string'
                    }
                }
            },
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
            var app = await fastify.redis.get(`app:${req.params.app_id}:info`)
            if (!app) return res.callNotFound()
            var changelogs = await fastify.redis.smembers(`app:${req.params.app_id}:changenumbers`)
            res.send(changelogs)
        }
    })
    fastify.route({
        method: 'GET',
        url: '/:app_id/changelog/:changelog_id',
        schema: {
            tags: ['Apps'],
            params: {
                type: 'object',
                properties: {
                    app_id: {
                        type: 'string'
                    },
                    changelog_id: {
                        type: 'string'
                    }
                }
            },
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
            var changelog = await fastify.redis.get(`changelog:app:${req.params.app_id}:${req.params.changelog_id}`)
            if (!changelog) return res.callNotFound()
            res.type('application/json').send(`${changelog}`)
        }
    })
    next()
}