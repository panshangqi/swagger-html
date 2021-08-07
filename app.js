const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const xmlParser = require('koa-xml-body')
const koaLogger = require('koa-logger')
const router = require('koa-router')();  /*引入是实例化路由** 推荐*/
const {historyApiFallback} = require('koa2-connect-history-api-fallback');
const static = require('koa-static')
const cors = require('@koa/cors');
const fs = require('fs')
const path = require('path')
const app = new Koa()


//这句代码需要在koa-static上面
app.use(historyApiFallback({
    index: '/index'
}));
//app.use(static(path.resolve(__dirname, './')))
app.use(static(path.resolve(__dirname, './dist/')))

/** gzip压缩配置 start **/
const compress = require('koa-compress');
const options = {
    threshold: 1024 //数据超过1kb时压缩
};
app.use(compress(options));
/** gzip压缩配置 end **/

/** 代理配置 start **/
const proxy = require('koa2-proxy-middleware'); //引入代理模块
const proxyOptions = {
    targets: {
        '/openapi/(.*)': {
            target: 'https://klximg.oss-cn-beijing.aliyuncs.com',
            changeOrigin: true,//处理跨域
            pathRewrite: {
                "^/openapi": ""
            }
        },
        // '/anscard_v2/(.*)': {
        //     target: 'http://klximg.oss-cn-beijing.aliyuncs.com',
        //     changeOrigin: true,//处理跨域
        // },
        // '/examine/(.*)': {
        //     target: 'http://klximg.oss-cn-beijing.aliyuncs.com',
        //     changeOrigin: true,//处理跨域
        // },
        // '/monitor_v1/(.*)': {// 监控
        //     target: config.light_support_system,// todo 更换
        //     changeOrigin: true,//处理跨域
        // },
        // '/monitor/(.*)': {// 监控
        //     target: config.monitor,
        //     changeOrigin: true,//处理跨域
        //     pathRewrite: {
        //         '^/api': ''
        //     }
        // },
    }
};

// 配置控制台日志
app.use(koaLogger((str, args) => {
    console.log(new Date().toLocaleString() + str)
}))
app.use(cors());
// 注册中间件
//app.use(ctx_function())
//app.use(authenticated())
app.use(proxy(proxyOptions))


/**
 * router.allowedMethods()作用： 这是官方文档的推荐用法,我们可以
 * 看到 router.allowedMethods()用在了路由匹配 router.routes()之后,所以在当所有
 * 路由中间件最后调用.此时根据 ctx.status 设置 response 响应头
 *
 */
// render html
router.get('/index', (ctx, next) => {
    ctx.type = 'text/html;charset=utf-8';
    let file = path.join(__dirname, './dist/index.html')
    console.log(file)
    let html_buffer = fs.readFileSync(file)
    ctx.response.body = html_buffer.toString()
})

app.use(router.routes());   /*启动路由*/
app.use(router.allowedMethods());
const port = process.env.PORT || 8080;
console.log('port =', port);

async function startApp() {
    app.listen(port);
}

startApp()