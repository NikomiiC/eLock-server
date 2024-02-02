let resBody = {
    code: 0,  // 0 pass, 1 fail
    msg: '', //default empty
    payload: null // default null
}

function resResult(code, msg, payload) {
    //default
    const res = Object.create(resBody);

    code ? res.code = code : res.code = resBody.code;
    msg ? res.msg = msg : res.msg = resBody.msg;
    payload ? res.payload = payload : res.payload = resBody.payload;

    return res;
}

function sendError(msg) {
    throw new Error(msg);
}


module.exports = { resResult, sendError};