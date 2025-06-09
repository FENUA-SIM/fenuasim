const axios = require('axios');
require('dotenv').config();

const AIRALO_API_URL = process.env.NEXT_PUBLIC_AIRALO_API_URL;
const AIRALO_CLIENT_ID = process.env.AIRALO_CLIENT_ID;
const AIRALO_CLIENT_SECRET = process.env.AIRALO_CLIENT_SECRET;

async function getAiraloToken() {
  const url = `${AIRALO_API_URL}/token`;
  const formData = new URLSearchParams();
  formData.append('client_id', AIRALO_CLIENT_ID);
  formData.append('client_secret', AIRALO_CLIENT_SECRET);
  formData.append('grant_type', 'client_credentials');

  const response = await axios.post(url, formData, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data.data.access_token;
}

async function getAiraloPackages(token) {
  const url = `${AIRALO_API_URL}/packages`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data.data;
}

(async () => {
  try {
    const token = await getAiraloToken();
    const packages = await getAiraloPackages(token);
    console.dir(packages[0], { depth: null });
  } catch (err) {
    console.error(err);
  }
})(); 