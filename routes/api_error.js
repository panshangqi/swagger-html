class ApiError extends Error {
    constructor(error_code, message, content, name) {
        super();
        this.code = error_code
        this.message = message
        this.content = content
        this.name = name
    }
}

ApiError.Error404NotFound = { code: 404, name: 'not found' };
ApiError.Error403Forbidden = { code: 403, name: 'forbidden' };
ApiError.Error402UnLogin = { code: 402, name: 'un login' };
ApiError.Error401UnAuthorized = { code: 401, name: 'un authorized' };
ApiError.Error400BadRequest = { code: 400, name: 'bad request' };
ApiError.Error511SomeError = { code: 511, name: 'server some error' };
ApiError.Error512CheckFail = { code: 512, name: 'check fail' };
ApiError.ErrorForNeedParameter = (params_str) => {
    return new ApiError(400, `lack of params: ${params_str}`)
}
module.exports = ApiError;