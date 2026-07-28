const https = require('https');

const data = JSON.stringify({
  model: 'meta/llama-3.1-70b-instruct',
  messages: [{ role: 'user', content: 'Hello' }],
  max_tokens: 100
});

const options = {
  hostname: 'integrate.api.nvidia.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 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',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`RESPONSE: ${responseData}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
