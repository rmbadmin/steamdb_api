/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */

var fn = async (fastify, options, next) => {
    var package_cache = []
    var package_cache_age = new Date().getTime()
    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['Packages'],
            response: {
                200: {
                    apps: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example: 'package.id'
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
            if ((new Date().getTime() - package_cache_age) > 4 * 60 * 1000) {
                res.type('application/json').send(`{"packages":${JSON.stringify(package_cache)},"count":${package_cache.length}}`)
                package_cache = (await fastify.redis.scan(0, 'MATCH', 'package:*:info', 'COUNT', 99999999))[1].map(e => e.match(/package:([0-9]{0,100}):info/)[1]).sort((a, b) => Number(a) - Number(b))
                package_cache_age = new Date().getTime()
            } else {
                res.type('application/json').send(`{"packages":${JSON.stringify(package_cache)},"count":${package_cache.length}}`)
            }
        }
    })
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
            if (_package) {
                res.type('application/json').send(_package)
            } else {
                try {
                    _package = await getPackage(req.params.package_id)
                    var message = JSON.stringify(_package)
                    res.type('application/json').send(message)
                    fastify.redis.set(`package:${req.params.package_id}:info`, message)
                } catch (error) {
                    if (error.message == 'error') return res.callNotFound()
                    else throw error
                }
            }
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
            res.type('application/json').send(changelog)
        }
    })
    next()

    function getPackage(packageid, timeout = 5000) {
        return new Promise((res, rej) => {
            var _timeout = setTimeout(() => {
                rej('error')
            }, timeout)
            fastify.steam.getProductInfo([], [packageid], (err, apps, packages, unknownApps, unknownPackages) => {
                clearTimeout(_timeout)
                _timeout = null
                if (packages.length == 0 && unknownPackages.length == 1) return rej('error')
                res(packages[Object.keys(packages)[0]])
            })
        })
    }
    package_cache = (await fastify.redis.scan(0, 'MATCH', 'package:*:info', 'COUNT', 99999999))[1].map(e => e.match(/package:([0-9]{0,100}):info/)[1]).sort((a, b) => Number(a) - Number(b))
}
fn[Symbol.for('fastify.display-name')] = 'packages'
export default = fn