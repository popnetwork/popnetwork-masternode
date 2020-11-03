const { ethers } = require('ethers');
const { BigNumber } = require('bignumber.js');
const config = require('../../../config');
const { erc20ABI } = require('./erc20.js');
const { popchefABI } = require('./popchef.js');
var abi = require('ethereumjs-abi');
const electron = require('electron')
const remote = electron.remote
module.exports = {
  getTokenBalance,
  getTokenAllowance,
  tokenApprove,
  wcSendTransaction,
  wcTokenApprove,
  wcPopChefDeposit,
  wcPopChefWithdraw,
  getClaimablePop,
  getStakedBalance,
  getPopPerBlock,
  convertToWei
}

async function getTokenBalance (address, tokenAddress = remote.process.env.POP_TOKEN_ADDRESS) {
  try {
    provider = ethers.getDefaultProvider(remote.process.env.ETH_NETWORK, {
      etherscan: remote.process.env.ETHERSCAN_API_KEY,
      infura: remote.process.env.INFURA_API_KEY,
      alchemy: remote.process.env.ALCHEMY_API_KEY,
    })
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
    provider = ethers.getDefaultProvider(remote.process.env.ETH_NETWORK, {
      etherscan: remote.process.env.ETHERSCAN_API_KEY,
      infura: remote.process.env.INFURA_API_KEY,
      alchemy: remote.process.env.ALCHEMY_API_KEY,
    })
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
    provider = ethers.getDefaultProvider(remote.process.env.ETH_NETWORK, {
      etherscan: remote.process.env.ETHERSCAN_API_KEY,
      infura: remote.process.env.INFURA_API_KEY,
      alchemy: remote.process.env.ALCHEMY_API_KEY,
    })
    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider) 
    const txid = await contract.approve(spender, amount)
    return txid
  } catch (err) {
    console.log('getTokenAllowance: ', err)
    return ""
  }
}

async function getClaimablePop(address) {
  try {
    provider = ethers.getDefaultProvider(remote.process.env.ETH_NETWORK, {
      etherscan: remote.process.env.ETHERSCAN_API_KEY,
      infura: remote.process.env.INFURA_API_KEY,
      alchemy: remote.process.env.ALCHEMY_API_KEY,
    })
    const contract = new ethers.Contract(remote.process.env.STAKING_CONTRACT_ADDRESS, popchefABI, provider) 
    const res = await contract.claimablePop(address)
    const balance = ethers.utils.formatUnits(res, remote.process.env.POP_TOKEN_DECIMALS)
    return new BigNumber(balance)
  } catch (err) {
    console.log('getClaimablePop: ', err)
    return new BigNumber(0)
  }
}

async function getStakedBalance(address) {
  try {
    provider = ethers.getDefaultProvider(remote.process.env.ETH_NETWORK, {
      etherscan: remote.process.env.ETHERSCAN_API_KEY,
      infura: remote.process.env.INFURA_API_KEY,
      alchemy: remote.process.env.ALCHEMY_API_KEY,
    })
    const contract = new ethers.Contract(remote.process.env.STAKING_CONTRACT_ADDRESS, popchefABI, provider) 
    const res = await contract.userInfo(address)
    let balance = ethers.utils.formatUnits(res.amount, remote.process.env.POP_TOKEN_DECIMALS)
    return new BigNumber(balance)
  } catch (err) {
    console.log('getStakedBalance: ', err)
    return new BigNumber(0)
  }
}
async function getPopPerBlock() {
  try {
    provider = ethers.getDefaultProvider(remote.process.env.ETH_NETWORK, {
      etherscan: remote.process.env.ETHERSCAN_API_KEY,
      infura: remote.process.env.INFURA_API_KEY,
      alchemy: remote.process.env.ALCHEMY_API_KEY,
    })
    const contract = new ethers.Contract(remote.process.env.STAKING_CONTRACT_ADDRESS, popchefABI, provider) 
    const res = await contract.popPerBlock()
    let balance = ethers.utils.formatUnits(res, 18)
    return new BigNumber(balance)
  } catch (err) {
    console.log('getPopPerBlock: ', err)
    return new BigNumber(0)
  }
}

async function wcTokenApprove (connector, fromAddress, spender, amount='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
  try {
    const encoded = abi.simpleEncode("approve(address,uint256):(bool)", spender, amount)
    const toAddress = remote.process.env.POP_TOKEN_ADDRESS
    const data = '0x' + encoded.toString('hex')
    const value = '0x'
    return (await wcSendTransaction(connector, fromAddress, toAddress, data, value))
  } catch (err) {
    console.log('wcTokenApprove: ', err)
    return [null, err]
  }
}
async function wcPopChefDeposit (connector, fromAddress, amount) {
  try {
    const encoded = abi.simpleEncode("deposit(uint256)", amount)
    const toAddress = remote.process.env.STAKING_CONTRACT_ADDRESS
    const data = '0x' + encoded.toString('hex')
    const value = '0x'
    return (await wcSendTransaction(connector, fromAddress, toAddress, data, value))
  } catch (err) {
    console.log('wcPopChefWithdraw: ', err)
    return [null, err]
  }
}
async function wcPopChefWithdraw (connector, fromAddress, amount) {
  try {
    const encoded = abi.simpleEncode("withdraw(uint256)", amount)
    const toAddress = remote.process.env.STAKING_CONTRACT_ADDRESS
    const data = '0x' + encoded.toString('hex')
    const value = '0x'
    return (await wcSendTransaction(connector, fromAddress, toAddress, data, value))
  } catch (err) {
    console.log('wcPopChefWithdraw: ', err)
    return [null, err]
  }
}
async function wcSendTransaction (connector, fromAddress, toAddress, data, value) {
  try {
    provider = ethers.getDefaultProvider(remote.process.env.ETH_NETWORK, {
      etherscan: remote.process.env.ETHERSCAN_API_KEY,
      infura: remote.process.env.INFURA_API_KEY,
      alchemy: remote.process.env.ALCHEMY_API_KEY,
    })
    pendingTxCnt = await provider.getTransactionCount(fromAddress, "pending")
    const tx = {
      "from": fromAddress,
      "to": toAddress,
      "data": data,
      "gas": "0x30D40", // 200, 000
      "gasPrice": "0x2e90edd000", // 200,000,000,000
      "value": value, // 2441406250
      "nonce": pendingTxCnt 
    } 
    const txid = await connector.sendTransaction(tx)
    // const hash = hashTypedDataMessage(message)
    // const valid = await verifySignature(address, result, hash, connector.chainId)
    console.log('txid: ', txid)
    return [txid, null]
  } catch (err) {
    console.log('wcSendTransaction: ', err)
    return [null, err]
  }
}

function convertToWei(balance) {
  return (new BigNumber(balance)).multipliedBy(Math.pow(10, remote.process.env.POP_TOKEN_DECIMALS))
}
