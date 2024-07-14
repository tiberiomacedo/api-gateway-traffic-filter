const axios = require('axios');
const https = require('https');

const domain = '';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const cookie = '';
const token = '';
const headers = { 'Cookie': cookie, 'CSRF-Token': token };

const servers = [];
const traffics = [];

const getServer = () => {
    return axios({
        method: 'get',
        url: domain + '/api/topology',
        httpsAgent: httpsAgent,
        headers: headers
    });
};

const getTraffic = (server) => {
    return axios({
        method: 'get',
        /*url: domain + '/api/router/service/' + server.name + '/ops/search?format=json&field=leg&value=0&count=1000&ago=10m&field=operation&value=analytics&protocol=http',*/
        url: domain + '/api/router/service/' + server.name + '/ops/search?format=json&field=leg&value=0&count=1000&ago=24h&field=operation&value=analytics&field=subject&value=07a58d7f-5565-43f6-9be2-cc580a8d915f&protocol=http',
        httpsAgent: httpsAgent,
        headers: headers,
    });
};

const getTrace = (traffic) => {
    return axios({
        method: 'get',
        url: domain + '/api/router/service/' + traffic.server + '/ops/trace/' + traffic.correlationId + '?format=json&sentData=0&receivedData=0',
        httpsAgent: httpsAgent,
        headers: headers,
    })
}

(async () => {

    await getServer().then((response) => {
        response.data.result.services.forEach(function (server) {
            if (server.name.includes('apigw-traffic-manager-prod')) {
                servers.push(server);
            }
        });
    }).catch((err) => {
        console.error(err);
    });

    for (const server of servers) {
        await getTraffic(server).then((response) => {
            console.log(server.name + ' | ' + response.data.data.length);
            for (const traffic of response.data.data) {
                // console.log('  ' + traffic.correlationId + ' | ' + traffic.subject);
                traffics.push({
                    server: server.name,
                    correlationId: traffic.correlationId,
                    subject: traffic.subject
                });
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    let i = 1;

    for (const traffic of traffics) {
        await getTrace(traffic).then((response) => {
            for (const trace of response.data) {
                if (trace.text.includes('decodedJWTPayload') && trace.text.includes('SVC_FRONT_ECOM_B2B')) {
                    console.log('Transaction Id (SVC_FRONT_ECOM_B2B):', traffic.correlationId + ' | ' + traffic.subject);
                } else if (trace.text.includes('decodedJWTPayload') && trace.text.includes('SVC_EMAPCLOUD')) {
                    console.log('Transaction Id (SVC_EMAPCLOUD):', traffic.correlationId + ' | ' + traffic.subject);
                }
            }
        }).catch((err) => {
            console.error(err);
        });
        console.log(i + ' | ' + traffics.length);
        i++;
    }

})();