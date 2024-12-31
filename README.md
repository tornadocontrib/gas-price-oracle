# gas-price-oracle

### Deprecated

Use `eth_maxPriorityFeePerGas` or `eth_feeHistory` RPC method instead ( they are the same thing anyways )

Decentralized Gas Price Oracle that proxies recommended fee value from [polygon gas station](https://docs.polygon.technology/tools/gas/polygon-gas-station/#mainnet)

### Mainnet

0xf81a8d8d3581985d3969fe53bfa67074adfa8f3c

https://polygonscan.com/address/0xf81a8d8d3581985d3969fe53bfa67074adfa8f3c#readContract

### What is gas-price-oracle?

Gas price oracle is a decentralized proxy of gas station for polygon mainnet. It would update the recommended maxPriorityFeePerGas value to contracts which should be parsed from the GasPriceOracle contract.

One of the benefits of the GasPriceOracle contract is that it doesn't require centralized gas station API that would track your user-agent headers https://github.com/ethers-io/ethers.js/blob/main/src.ts/providers/network.ts#L327, or block requests very often https://github.com/ethers-io/ethers.js/issues/4320.

This would also ensure faster gas price fetching since it resolves all the necessary data by a single request. Also, there are necessary timestamp and heartbeat configuation that you could make a refer of.

You can see example/index.ts to see examples to integrate with ethers.js provider. In order to deploy on alternative chain or if you are seeking to modify the source code of the server you can refer contracts and src folder.

## ABI

```
[
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "GAS_UNIT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_derivationThresold",
        "type": "uint32"
      }
    ],
    "name": "changeDerivationThresold",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_gasUnit",
        "type": "uint32"
      }
    ],
    "name": "changeGasUnit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_heartbeat",
        "type": "uint32"
      }
    ],
    "name": "changeHeartbeat",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "changeOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "derivationThresold",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gasPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "heartbeat",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxFeePerGas",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxPriorityFeePerGas",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pastGasPrice",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_gasPrice",
        "type": "uint32"
      }
    ],
    "name": "setGasPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "timestamp",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
```
