const config = require('../../config')

module.exports = {
    apiGetTorrents,
  }
  
  const axios = require('axios');
  
  const api = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 30000, // 30 secs
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  
  async function apiGetTorrents (address, chainId) {
    const response = await api.get('/torrents');
    const { data } = response.data;
    return data;
  }