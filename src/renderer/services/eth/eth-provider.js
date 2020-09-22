const { ethers } = require('ethers');
const config = require('../../../config');
const { erc20ABI } = require('./ERC20.js');
const { stakingABI } = require('./Staking.js');
module.exports = {
  getTokenBalance,
  getTest
}

async function getTokenBalance (address, tokenAddress) {
  provider = ethers.getDefaultProvider(config.ETH_NETWORK)
  provider.getBalance = provider.getBalance.bind(provider)
  const contract = new ethers.Contract(tokenAddress, erc20ABI, provider) 
  const balance = await contract.balanceOf(address);
  const decimals = await contract.decimals()
  const tokenBalance = ethers.utils.formatUnits(balance, decimals)
  return Number(tokenBalance)
}

async function getTest () {
  provider = ethers.getDefaultProvider(config.ETH_NETWORK)
  provider.getBalance = provider.getBalance.bind(provider)
  const contract = new ethers.Contract(config.STAKING_CONTRACT_ADDRESS, stakingABI, provider) 
  const admin = await contract.admin();
  // const decimals = await contract.decimals()
  // const tokenBalance = ethers.utils.formatUnits(balance, decimals)
  return admin;
}