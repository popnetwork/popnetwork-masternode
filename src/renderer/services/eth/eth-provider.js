const { ethers } = require('ethers');
const { BigNumber } = require('bignumber.js');
const ethConfig = require('./config')
const { erc20ABI } = require('./erc20.js');
const { popchefABI } = require('./popchef.js');
const {apiGetGasPrices} = require('./eth-api.js');
var abi = require('ethereumjs-abi');
const config = require('../../../config')

let provider = null;
let chainId = null;

module.exports = {
  getProvider,
  getEthBalance,
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

function getProvider(chainID) {
  chainId = chainID
  if (chainId === 1 || chainId === 3) {
    provider = ethers.getDefaultProvider(chainId === 1 ? "homestead" : 'ropsten', {
      etherscan: config.ETHERSCAN_API_KEY,
      infura: config.INFURA_API_KEY,
    });
  } else if (chainId === 56) {
    provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/', { name: 'BSCMain', chainId: 56 })
  } else if (chainId === 97) {
    provider = new ethers.providers.JsonRpcProvider('https://bsc.getblock.io/testnet/?api_key=0be38a02-4c7e-4f83-8cce-7614595bc50b', { name: 'binance', chainId: 97 })
  }
}

async function getEthBalance (address) {
  try {
    const weiBalance = await provider.getBalance(address)
    return new BigNumber(ethers.utils.formatEther(weiBalance))
  } catch (err) {
    console.log('getTokenBalance: ', err)
    return new BigNumber(0)
  }
}

async function getTokenBalance (address) {
  try {
    const tokenAddress = ethConfig.POP_TOKEN_ADDRESS[chainId]
    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider) 
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals()
    const tokenBalance = ethers.utils.formatUnits(balance, decimals)
    return new BigNumber(tokenBalance)
  } catch (err) {
    console.log('getTokenBalance: ', err)
    return new BigNumber(config.ERROR_BALANCE)
  }
}

async function getTokenAllowance (tokenOwner, spender, tokenAddress) {
  try {
    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider) 
    let remaining = await contract.allowance(tokenOwner, spender)
    const decimals = await contract.decimals()
    remaining = ethers.utils.formatUnits(remaining, decimals)
    return new BigNumber(remaining)
  } catch (err) {
    console.log('getTokenAllowance: ', err)
    return new BigNumber(config.ERROR_BALANCE)
  }
}
async function tokenApprove (spender, amount=0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff) {
  try {
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
    const contract = new ethers.Contract(ethConfig.STAKING_CONTRACT_ADDRESS[chainId], popchefABI, provider) 
    const res = await contract.claimablePop(address)
    const balance = ethers.utils.formatUnits(res, ethConfig.POP_TOKEN_DECIMALS[chainId])
    return new BigNumber(balance)
  } catch (err) {
    console.log('getClaimablePop: ', err)
    return new BigNumber(config.ERROR_BALANCE)
  }
}

async function getStakedBalance(address) {
  try {
    const contract = new ethers.Contract(ethConfig.STAKING_CONTRACT_ADDRESS[chainId], popchefABI, provider) 
    const res = await contract.userInfo(address)
    let balance = ethers.utils.formatUnits(res.amount, ethConfig.POP_TOKEN_DECIMALS[chainId])
    return new BigNumber(balance)
  } catch (err) {
    console.log('getStakedBalance: ', err)
    return new BigNumber(config.ERROR_BALANCE)
  }
}
async function getPopPerBlock() {
  try {
    const contract = new ethers.Contract(ethConfig.STAKING_CONTRACT_ADDRESS[chainId], popchefABI, provider) 
    const res = await contract.getPopPerBlock()
    let balance = ethers.utils.formatUnits(res, 18)
    return new BigNumber(balance)
  } catch (err) {
    console.log('getPopPerBlock: ', err)
    return new BigNumber(config.ERROR_BALANCE)
  }
}

async function wcTokenApprove (connector, fromAddress, spender, amount='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') {
  try {
    const encoded = abi.simpleEncode("approve(address,uint256):(bool)", spender, amount)
    const toAddress = ethConfig.POP_TOKEN_ADDRESS[chainId]
    const data = '0x' + encoded.toString('hex')
    const value = '0x0'
    return (await wcSendTransaction(connector, fromAddress, toAddress, data, value))
  } catch (err) {
    console.log('wcTokenApprove: ', err)
    return [null, err]
  }
}
async function wcPopChefDeposit (connector, fromAddress, amount) {
  try {
    const encoded = abi.simpleEncode("deposit(uint256)", amount)
    const toAddress = ethConfig.STAKING_CONTRACT_ADDRESS[chainId]
    const data = '0x' + encoded.toString('hex')
    const value = '0x0';
    return (await wcSendTransaction(connector, fromAddress, toAddress, data, value))
  } catch (err) {
    console.log('wcPopChefDeposit: ', err)
    return [null, err]
  }
}
async function wcPopChefWithdraw (connector, fromAddress, amount) {
  try {
    const encoded = abi.simpleEncode("withdraw(uint256)", amount)
    const toAddress = ethConfig.STAKING_CONTRACT_ADDRESS[chainId]
    const data = '0x' + encoded.toString('hex')
    const value = '0x0';
    return (await wcSendTransaction(connector, fromAddress, toAddress, data, value))
  } catch (err) {
    console.log('wcPopChefWithdraw: ', err)
    return [null, err]
  }
}
async function wcSendTransaction (connector, fromAddress, toAddress, data, value) {
  try {
    pendingTxCnt = await provider.getTransactionCount(fromAddress, "pending")
    const tx = {
      "from": fromAddress,
      "to": toAddress,
      "data": data,
      "value": value, // 2441406250
    } 
    let gas = "0x30D40"; // 200, 000
    let gasPrice = "0x2e90edd000"; // 200,000,000,000
    
    try {
      gas = await provider.estimateGas(tx);
      gas = gas.toHexString();
      gasPrices = await apiGetGasPrices();
      const _gasPrice = gasPrices.average.price;
      gasPrice = ethers.utils.parseUnits(_gasPrice.toString(), 9).toHexString();
    } catch (e) {
      console.log('gas:', e)
    }
    tx.gas = gas;
    tx.gasPrice = gasPrice;
    tx.nonce = pendingTxCnt;
    const txid = await connector.sendTransaction(tx)
    console.log('txid: ', txid)
    return [txid, null]
  } catch (err) {
    console.log('wcSendTransaction: ', err)
    return [null, err]
  }
}

function convertToWei(balance) {
  return (new BigNumber(balance)).multipliedBy(Math.pow(10, ethConfig.POP_TOKEN_DECIMALS[chainId]))
}
