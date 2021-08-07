/**
 * 在app.use(router)之前调用
 */

const redisOp = require('./redis_op')
function get_route(url){
    let pos = url.indexOf('?')
    if(pos > -1){
        return url.substr(0, pos)
    }
    return url
}

module.exports = function() {
    return async(ctx, next) => {
        let cur_route = get_route(ctx.request.url)
        console.log(cur_route)
        if(cur_route.startsWith('/light_support')){

            let check = await ctx.check_login()
            if(!check){
                ctx.body = { code: 401, type: 'ERROR', message: 'Unauthorized 登录状态失效'}
                return
            }
        }
        await next();
    }
}