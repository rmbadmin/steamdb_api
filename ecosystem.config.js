module.exports = {
    apps:[
        {
            name:'SteamDB-API',
            script:'src/index.mjs',
            instances  : 1,
            exec_mode  : "cluster",
            env:{
                PORT:3004,
                REDIS_HOST:'localhost',
                REDIS_PORT:6379
            }
        }
    ],
    deploy:{
        prod:{
            user:'root',
            host:['caerus'],
            ref:'origin/prod',
            repo:'git@github.com:SteamDB-API/api',
            path:'/root/node/steamdb/api',
            'post-deploy':'npm i; pm2 startOrRestart ecosystem.config.js',
        }
    }
}