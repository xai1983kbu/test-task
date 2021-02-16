const origin = "*";

exports.createResponse = (statusCode, body, headers) => {
    const response = {}
    if (!statusCode) throw Error("statusCode is required");
    else response.statusCode = statusCode;
    if (body) response.body = JSON.stringify(body);
    else response.body = JSON.stringify({});
    if (headers) response.headers = {
        "Access-Control-Allow-Origin": origin,
        ...headers
    };
    else response.headers = {
        "Access-Control-Allow-Origin": origin
    };
    return response;
}
