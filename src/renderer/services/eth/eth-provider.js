const { ethers } = require('ethers');
const config = require('../../../config');
const { erc20ABI } = require('./ERC20.js');

module.exports = {
  getTokenBalance
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