/**
 * 在app.use(router)之前调用
 */
const ApiError = require('./api_error')
const redisOp = require('./redis_op')
module.exports = function() {
    return async(ctx, next) => {
        ctx.rest = (data) => {
            if(data){
                ctx.body = {body: data, type: 'AJAX', code: 200}
            } else {
                ctx.body = {body: 'success', type: 'AJAX', code: 200}
            }
        }

        ctx.onError = (errorCode, message = '') => {
            ctx.body = { code: errorCode, type: 'ERROR', message: message}
        }

        ctx.checkParameter =(need_params)=>{
            let requestBody = {...ctx.request.body, ...ctx.request.query, ...ctx.params, ...{token: ctx.header.token, user_id: ctx.header.uid}}
            if(!need_params){
                return requestBody
            }
            if(typeof need_params == 'string'){
                if(requestBody[need_params] == undefined){
                    throw ApiError.ErrorForNeedParameter(need_params)
                }

            } else if(Array.isArray(need_params)){
                for(let key of need_params){
                    if(requestBody[key] == undefined){
                        throw ApiError.ErrorForNeedParameter(key)
                    }
                }
            } else{
                throw new APIError(400, 'error: second params of checkParameter must be string or array')
            }

            return requestBody
        }
        ctx.check_login = async () => {
            //检查登录
            let token = ctx.headers.token || undefined
            let user_id = ctx.headers.uid || undefined
            console.log(`token=${token}, user_id=${user_id}`)
            if (!token || !user_id) {
                return false
            }
            let check_res = await redisOp.get(user_id)
            console.log(check_res, typeof check_res)
            if (!check_res) {
                return false
            }
            return true
        }
        await next();
    }
}