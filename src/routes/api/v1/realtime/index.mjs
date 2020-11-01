/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {object} options 
 * @param {Function} next
 */
export default (fastify, options, next) => {
    fastify.redis.listener.subscribe('STEAM_DB:UPDATE', 'STEAM_DB:BOT_LOGIN', 'STEAM_DB:BOT_LOGOFF', 'STEAM_DB:BOT_STARTUP', 'STEAM_DB:BOT_SHUTDOWN', () => {})
    fastify.register(import('fastify-websocket'), {
        /**
         * @param {import('fastify-websocket').SocketStream} conn
         * @param {import('http').IncomingMessage} req
         */
        handle: async (conn, req) => {
            console.log(`101 (WS) (OPEN) "${req.method}:${req.url}" [${req.headers['cf-connecting-ip']||req.connection.remoteAddress}:${req.connection.remotePort}] [${req.headers["user-agent"]||'NO_UA'}] `)
            var url = new URL(`http://localhost${req.url}`)
            url.pathname = url.pathname.slice('/api/v1/realtime'.length)
            if (url.pathname.endsWith('/') && url.pathname !== '/') url.pathname = url.pathname.slice(0, -1)
            if (url.pathname == '/') {
                conn.socket.send(JSON.stringify({
                    event: "CONNECTED",
                    data: {
                        ip: req.headers['cf-connecting-ip'] || req.connection.remoteAddress
                    }
                }))
            } else {
                conn.socket.close()
            }
            conn.socket.on('close', () => {
                console.log(`101 (WS) (CLOSE) "${req.method}:${req.url}" [${req.headers['cf-connecting-ip']||req.connection.remoteAddress}:${req.connection.remotePort}] [${req.headers["user-agent"]||'NO_UA'}] `)
            })
        }
    })
    fastify.redis.listener.on('message', (channel, message) => {
        switch (channel) {
            case 'STEAM_DB:UPDATE':
                fastify.websocketServer.clients.forEach(socket => {
                    socket.send(`{"event":"UPDATE","data":${message}}`)
                })
                break;
            case 'STEAM_DB:BOT_LOGIN':
                var message = JSON.stringify({
                    event: 'BOT_LOGIN',
                    data: {
                        id: message
                    }
                })
                fastify.websocketServer.clients.forEach(socket => {
                    socket.send(message)
                })
                break;
            case 'STEAM_DB:BOT_LOGOFF':
                var message = JSON.stringify({
                    event: 'BOT_LOGOFF'
                })
                fastify.websocketServer.clients.forEach(socket => {
                    socket.send(message)
                })
                break;
            case 'STEAM_DB:BOT_STARTUP':
                var message = JSON.stringify({
                    event: 'BOT_STARTUP'
                })
                fastify.websocketServer.clients.forEach(socket => {
                    socket.send(message)
                })
                break;
            case 'STEAM_DB:BOT_SHUTDOWN':
                var message = JSON.stringify({
                    event: 'BOT_SHUTDOWN'
                })
                fastify.websocketServer.clients.forEach(socket => {
                    socket.send(message)
                })
                break;
        }
    })
    next()
}