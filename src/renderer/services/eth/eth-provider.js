const { ethers } = require('ethers');
const { BigNumber } = require('bignumber.js');
const config = require('../../../config');
const { erc20ABI } = require('./ERC20.js');
const { stakingABI } = require('./Staking.js');
module.exports = {
  getTokenBalance,
  getTokenAllowance,
  tokenApprove,
  getTest
}

async function getTokenBalance (address, tokenAddress) {
  try {
    provider = ethers.getDefaultProvider(config.ETH_NETWORK)
    provider.getBalance = provider.getBalance.bind(provider)
    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider) 
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals()
    const tokenBalance = ethers.utils.formatUnits(balance, decimals)
    return new BigNumber(tokenBalance)
  } catch (err) {
    console.log('getTokenBalance: ', err)
    return new BigNumber(0)
  }
}

async function getTokenAllowance (tokenOwner, spender, tokenAddress) {
  try {
    provider = ethers.getDefaultProvider(config.ETH_NETWORK)
    provider.getBalance = provider.getBalance.bind(provider)
    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider) 
    let remaining = await contract.allowance(tokenOwner, spender)
    const decimals = await contract.decimals()
    remaining = ethers.utils.formatUnits(remaining, decimals)
    return new BigNumber(remaining)
  } catch (err) {
    console.log('getTokenAllowance: ', err)
    return new BigNumber(0)
  }
}
async function tokenApprove (spender, amount=0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff) {
  try {
    provider = ethers.getDefaultProvider(config.ETH_NETWORK)
    provider.getBalance = provider.getBalance.bind(provider)
    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider) 
    const txid = await contract.approve(spender, amount)
    return txid
  } catch (err) {
    console.log('getTokenAllowance: ', err)
    return ""
  }
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
