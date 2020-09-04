module.exports = {
    apiGetAccountAssets,
    apiGetAccountTransactions,
    apiGetAccountNonce,
    apiGetGasPrices,
  }
  
  const axios = require('axios');
  
  const api = axios.create({
    baseURL: "https://ethereum-api.xyz",
    timeout: 30000, // 30 secs
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  
  async function apiGetAccountAssets (address, chainId) {
    const response = await api.get(`/account-assets?address=${address}&chainId=${chainId}`);
    const { result } = response.data;
    return result;
  }
  
  async function apiGetAccountTransactions (address, chainId) {
    const response = await api.get(`/account-transactions?address=${address}&chainId=${chainId}`);
    const { result } = response.data;
    return result;
  }
  
  async function apiGetAccountNonce (address, chainId) {
    const response = await api.get(`/account-nonce?address=${address}&chainId=${chainId}`);
    const { result } = response.data;
    return result;
  };
  
  async function apiGetGasPrices () {
    const response = await api.get(`/gas-prices`);
    const { result } = response.data;
    return result;
  };
  