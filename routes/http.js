const request = require('request')

const HTTP = {
    getSync: function (url, data, dataType) {
        var index = 0;
        var params = '';
        for (var key in data) {
            params += (index == 0) ? '?' : '&';
            params += key;
            params += '=';
            params += data[key];
            index++;
        }
        var final_url = url + params;
        return new Promise((resolve, reject) => {
            request({
                url: final_url,
                method: "GET",
                json: dataType ? true: false,
                'Content-Type': 'application/json',
                headers:{}
            }, function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    resolve(body)
                } else {
                    console.log(error)
                    throw new Error(error.stack)
                }
            })
        }).catch((e)=>{
            throw new Error(e.stack)
        })
    },
    postSync: function (url, data, dataType) {
        return new Promise((resolve, reject)=>{
            request({
                url: url,
                method: "POST",
                json: dataType? true: false,
                headers: {},
                body: data
            }, function (error, response, body) {
                //console.log(response)
                //console.log(body)
                if (!error && response.statusCode == 200) {
                    resolve(body)
                } else {
                    console.log(error)
                    throw new Error(error.stack)
                }
            });
        }).catch((e)=>{
            throw new Error(e.stack)
        })
    }
}
module.exports = HTTP