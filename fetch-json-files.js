const axios = require('axios');
const fs = require('fs');
const path = require('path');

const appId = process.env.TDX_APP_ID;
const appKey = process.env.TDX_APP_KEY;

async function fetchToken() {
  console.log('Fetching token...');
  const authUrl = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
  const response = await axios.post(authUrl, 
    `grant_type=client_credentials&client_id=${appId}&client_secret=${appKey}`, 
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  if (response.status !== 200) {
    console.error('Failed to fetch token:', response.status, response.data);
    throw new Error('Failed to fetch token');
  }

  console.log('Token fetched successfully');
  return response.data.access_token;
}

const urls = [
  'https://tdx.transportdata.tw/api/basic/v2/Rail/Metro/StationTimeTable/TRTC?%24top=99999&%24format=JSON',
  'https://tdx.transportdata.tw/api/basic/v2/Rail/Metro/StationTimeTable/KLRT?%24top=99999&%24format=JSON',
  'https://tdx.transportdata.tw/api/basic/v2/Rail/Metro/StationTimeTable/KRTC?%24top=99999&%24format=JSON',
  'https://tdx.transportdata.tw/api/basic/v2/Rail/Metro/StationTimeTable/NTALRT?%24top=99999&%24format=JSON',
  'https://tdx.transportdata.tw/api/basic/v2/Rail/Metro/StationTimeTable/NTDLRT?%24top=99999&%24format=JSON',
  'https://tdx.transportdata.tw/api/basic/v2/Rail/Metro/StationTimeTable/TYMC?%24top=99999&%24format=JSON'
];

async function fetchAndSave(url, token) {
  try {
    console.log(`Fetching data from ${url}...`);
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const fileName = path.basename(url);
    const filePath = path.join(__dirname, 'json-files', fileName);
    fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
    console.log(`Successfully fetched and saved ${fileName}`);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
  }
}

async function main() {
  try {
    const token = await fetchToken();
    console.log('Token:', token);
    if (!fs.existsSync('json-files')) {
      fs.mkdirSync('json-files');
    }

    await Promise.all(urls.map(url => fetchAndSave(url, token)));
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

main();
