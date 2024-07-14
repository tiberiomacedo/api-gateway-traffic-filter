const axios = require('axios');
const https = require('https');

const domain = '';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const cookie = '';
const token = '';
const headers = { 'Cookie': cookie, 'CSRF-Token': token };

axios({
    method: 'get',
    url: domain + '/api/topology',
    httpsAgent: httpsAgent,
    headers: headers,
}).then((topologyData) => {
    // console.log(topologyData.config.url + ' | ' + topologyData.data.result.services.length);

    topologyData.data.result.services.forEach(function (server) {
        axios({
            method: 'get',
            url: domain + '/api/router/service/' + server.id + '/ops/search?format=json&field=leg&value=0&count=1000&ago=10m&field=operation&value=analytics&protocol=http',
            httpsAgent: httpsAgent,
            headers: headers,
        }).then((searchData) => {
            // console.log('  ' + searchData.config.url + ' | ' + searchData.data.data.length);

            searchData.data.data.forEach(function (traffic) {
                axios({
                    method: 'get',
                    url: domain + '/api/router/service/' + server.id + '/ops/trace/' + traffic.correlationId + '?format=json&sentData=0&receivedData=0',
                    httpsAgent: httpsAgent,
                    headers: headers,
                }).then((traceData) => {
                    // console.log('    ' + traceData.config.url + ' | ' + traceData.data.length*/);

                    traceData.data.forEach(function (trace) {
                        // console.log(trace.text);
                        if (trace.text.includes('decodedJWTPayload') && trace.text.includes('SVC_FRONT_ECOM_B2B')) {
                            console.log('Transaction Id (SVC_FRONT_ECOM_B2B):', traffic.correlationId);
                        } else if (trace.text.includes('decodedJWTPayload') && trace.text.includes('SVC_EMAPCLOUD')) {
                            console.log('Transaction Id (SVC_EMAPCLOUD):', traffic.correlationId);
                        }
                    });
                }).catch((err2) => {
                    console.error(err2.code + ' | ' + err2.config.url);
                });
            });
        }).catch((err1) => {
            console.error(err1.code + ' | ' + err1.config.url);
        });
    });
}).catch((err0) => {
    console.error(err0);
});