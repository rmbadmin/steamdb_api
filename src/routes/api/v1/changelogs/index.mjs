/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default async (fastify, options, next) => {
    var changelog_cache = [...new Set((await fastify.redis.scan(0, 'MATCH', 'changelog:*:*:*', 'COUNT', 99999999))[1].map(e => e.match(/changelog:(app|package):([0-9]{0,100}):([0-9]{0,100})/)[3]).sort((a, b) => Number(a) - Number(b)))]
    var changelog_cache_age = new Date().getTime()
    var changelog_apps_cache = [...new Set((await fastify.redis.scan(0, 'MATCH', 'changelog:app:*:*', 'COUNT', 99999999))[1].map(e => e.match(/changelog:app:([0-9]{0,100}):([0-9]{0,100})/)[2]).sort((a, b) => Number(a) - Number(b)))]
    var changelog_apps_cache_age = new Date().getTime()
    var changelog_packages_cache = [...new Set((await fastify.redis.scan(0, 'MATCH', 'changelog:package:*:*', 'COUNT', 99999999))[1].map(e => e.match(/changelog:package:([0-9]{0,100}):([0-9]{0,100})/)[2]).sort((a, b) => Number(a) - Number(b)))]
    var changelog_packages_cache_age = new Date().getTime()
    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['Changelogs'],
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
            if ((new Date().getTime() - changelog_cache_age) > 4 * 60 * 1000) {
                res.type('application/json').send(`{"packages":${JSON.stringify(changelog_cache)},"count":${changelog_cache.length}}`)
                changelog_cache = [...new Set((await fastify.redis.scan(0, 'MATCH', 'changelog:*:*:*', 'COUNT', 99999999))[1].map(e => e.match(/changelog:(app|package):([0-9]{0,100}):([0-9]{0,100})/)[3]).sort((a, b) => Number(a) - Number(b)))]
                changelog_cache_age = new Date().getTime()
            } else {
                res.type('application/json').send(`{"packages":${JSON.stringify(changelog_cache)},"count":${changelog_cache.length}}`)
            }
        }
    })
    fastify.route({
        method: 'GET',
        url: '/apps',
        schema: {
            tags: ['Changelogs'],
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
            if ((new Date().getTime() - changelog_apps_cache_age) > 4 * 60 * 1000) {
                res.type('application/json').send(`{"packages":${JSON.stringify(changelog_apps_cache)},"count":${changelog_apps_cache.length}}`)
                changelog_apps_cache = [...new Set((await fastify.redis.scan(0, 'MATCH', 'changelog:app:*:*', 'COUNT', 99999999))[1].map(e => e.match(/changelog:app:([0-9]{0,100}):([0-9]{0,100})/)[2]).sort((a, b) => Number(a) - Number(b)))]
                changelog_apps_cache_age = new Date().getTime()
            } else {
                res.type('application/json').send(`{"packages":${JSON.stringify(changelog_apps_cache)},"count":${changelog_apps_cache.length}}`)
            }
        }
    })
    fastify.route({
        method: 'GET',
        url: '/packages',
        schema: {
            tags: ['Changelogs'],
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
            if ((new Date().getTime() - changelog_packages_cache_age) > 4 * 60 * 1000) {
                res.type('application/json').send(`{"packages":${JSON.stringify(changelog_packages_cache)},"count":${changelog_packages_cache.length}}`)
                changelog_packages_cache = [...new Set((await fastify.redis.scan(0, 'MATCH', 'changelog:package:*:*', 'COUNT', 99999999))[1].map(e => e.match(/changelog:package:([0-9]{0,100}):([0-9]{0,100})/)[2]).sort((a, b) => Number(a) - Number(b)))]
                changelog_packages_cache_age = new Date().getTime()
            } else {
                res.type('application/json').send(`{"packages":${JSON.stringify(changelog_packages_cache)},"count":${changelog_packages_cache.length}}`)
            }
        }
    })
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