const { ethers } = require('ethers');
const { BigNumber } = require('bignumber.js');
const config = require('../../../config');
const { erc20ABI } = require('./ERC20.js');
const { stakingABI } = require('./Staking.js');
var abi = require('ethereumjs-abi');
module.exports = {
  getTokenBalance,
  getTokenAllowance,
  tokenApprove,
  wcSendTransaction,
  wcTokenApprove,
  getTest,
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
async function wcTokenApprove (connector, fromAddress, spender, amount='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
  try {
    const encoded = abi.simpleEncode("approve(address,uint256):(bool)", spender, amount)
    const toAddress = config.POP_TOKEN_ADDRESS
    const data = '0x' + encoded.toString('hex')
    const value = '0x'
    return (await wcSendTransaction(connector, fromAddress, toAddress, data, value))
  } catch (err) {
    console.log('wcTokenApprove: ', err)
    return [null, err]
  }
}
async function wcSendTransaction (connector, fromAddress, toAddress, data, value) {
  try {
    provider = ethers.getDefaultProvider(config.ETH_NETWORK)
    provider.getBalance = provider.getBalance.bind(provider)
    pendingTxCnt = await provider.getTransactionCount(fromAddress, "pending")
    const tx = {
      "from": fromAddress,
      "to": toAddress,
      "data": data,
      "gas": "0x186A0", // 100, 000
      "gasPrice": "0x2e90edd000", // 200,000,000,000
      "value": value, // 2441406250
      "nonce": pendingTxCnt 
    } 
    const txid = await connector.sendTransaction(tx)
    // const hash = hashTypedDataMessage(message)
    // const valid = await verifySignature(address, result, hash, connector.chainId)
    return [txid, null]
  } catch (err) {
    console.log('wcSendTransaction: ', err)
    return [null, err]
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
