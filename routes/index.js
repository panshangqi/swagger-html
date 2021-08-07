
const router = require('koa-router')();  /*引入是实例化路由** 推荐*/
const uuid = require('node-uuid');
const md5 = require('md5')
const fs = require('fs')
const path = require('path')
const http = require('./http')
const redisOp = require('./redis_op')
const ApiError = require('./api_error')

router.get('/user/session', async (ctx, next)=>{
    let params = ctx.checkParameter(['ticket', 'backup_url'])
    let res = await http.getSync('https://sso.oaloft.com/cas/validate', {
        service: params.backup_url, ticket: params.ticket}, false)
    let response = {}
    let results = res.split('\n')
    if(!results || results[0] == 'no'){
        response = {
            success: 'no',
            message: 'sso 登录失败'
        }
    } else if(results && results[0] == 'yes') {
        //生成token并存储redis
        let token = md5(uuid.v1())
        let username = results[1]
        redisOp.set(username, JSON.stringify({
            token: token,
            stime: new Date().getTime()
        }), 24*3600) //设置中台过期时间 一天
        response = {
            success: 'yes',
            message: 'sso 登录成功',
            username: username,
            token: token
        }
    }
    ctx.rest(response)
})
router.post('/logout', async(ctx, next)=> {
    let params = ctx.checkParameter()
    console.log(params)
    let check = await ctx.check_login()
    if(check){
        redisOp.del(params.user_id)
    }
    ctx.rest()
})
// render html
router.get('/index', (ctx, next) => {
    ctx.type = 'text/html;charset=utf-8';
    let file = path.join(__dirname, '../build/index.html')
    console.log(file)
    let html_buffer = fs.readFileSync(file)
    ctx.response.body = html_buffer.toString()
})

//权限
router.get('/check/login/status', async (ctx, next) => {

    let check = await ctx.check_login()
    if (!check) {
        ctx.rest({ status: 'fail', message: 'Unauthorized 登录状态失效'})
        return
    }
    ctx.rest({ status: 'success', message: '登录状态成功'})
})

router.get('/ping/health', (ctx, next) => {
    ctx.rest()
})

module.exports = router