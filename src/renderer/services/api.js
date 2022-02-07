const config = require('../../config')

module.exports = {
  apiGetTorrents,
  apiGetRewardHistories,
  apiCreateRewardHistory,
  apiGetStakeConfig,
  apiGetWallets,
}
  
const axios = require('axios');

const api = axios.create({
  baseURL: config.DEV_API_BASE_URL,
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Authorization": config.DEV_AUTHORIZATION,
  },
});

async function apiGetTorrents () {
  const response = await api.get('/torrents');
  const { data } = response.data;
  return data;
}

async function apiGetRewardHistories (address, token) {
  const response = await api.get(`/reward_histories?address=${address}`);

  const { data } = response.data;
  return data;
}

async function apiCreateRewardHistory (token, address, actionType, amount, txid) {
  const params = {
    token,
    address,
    action_type: actionType,
    amount,
    txid,
  };
  const response = await api.post('/reward_histories', params);
  const { data } = response.data;
  return data;
}

async function apiGetStakeConfig() {
  const response = await api.get(`/get_stake_config`);
  const { data } = response.data;
  return data;
}

async function apiGetWallets(address, token, staked_balance, network) {
  const params = {
    token,
    address,
    staked_balance,
    version: config.APP_VERSION,
    platform: process.platform, // "win32", "darwin", "linux",
    network
  };
  const response = await api.post('/wallets', params);
  const { data } = response.data;
  return data;
}