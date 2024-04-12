import { JsonRpcProvider, Wallet, HDNodeWallet, BaseContract, parseUnits } from 'ethers';
import { GasPriceOracle, GasPriceOracle__factory, Multicall3, Multicall3__factory } from '../typechain-types';
import 'dotenv/config';

const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS || '0xF81A8D8D3581985D3969fe53bFA67074aDFa8F3C';

const GAS_STATION = process.env.GAS_STATION || 'https://gasstation.polygon.technology/v2';

const UPDATE_INTERVAL = Number(process.env.UPDATE_INTERVAL) || 600;

const RPC_URL = process.env.RPC_URL as string;

const MNEMONIC = process.env.MNEMONIC as string;

let wallet: HDNodeWallet;
let Oracle: GasPriceOracle;
let Multicall: Multicall3;

export interface gasstation {
  standard: {
    maxPriorityFee: number;
    maxFee: number;
  };
}

export interface Call3 {
  contract: BaseContract;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[];
  allowFailure?: boolean;
}

async function multicall(calls: Call3[]) {
  const calldata = calls.map((call) => ({
    target: call.contract.target,
    callData: call.contract.interface.encodeFunctionData(call.name, call.params),
    allowFailure: call.allowFailure ?? false
  }));

  const returnData = await Multicall.aggregate3.staticCall(calldata);

  const res = returnData.map((call, i) => {
    const [result, data] = call;
    const decodeResult = (result && data && data !== '0x') ? calls[i].contract.interface.decodeFunctionResult(calls[i].name, data) : null;
    return !decodeResult ? null : decodeResult.length === 1 ? decodeResult[0] : decodeResult;
  });

  return res;
}

async function fetchGasStation() {
  const { standard } = await (await fetch(GAS_STATION, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })).json() as unknown as gasstation;

  return standard;
}

async function updateOracle() {
  try {
    const [[owner, pastGasPrice, timestamp, derivationThresold, heartbeat], gasData] = await Promise.all([
      multicall([
        {
          contract: Oracle,
          name: 'owner'
        },
        {
          contract: Oracle,
          name: 'pastGasPrice'
        },
        {
          contract: Oracle,
          name: 'timestamp'
        },
        {
          contract: Oracle,
          name: 'derivationThresold'
        },
        {
          contract: Oracle,
          name: 'heartbeat'
        }
      ]),
      fetchGasStation(),
    ]);
  
    if (wallet.address !== owner) {
      const errMsg = `Connected wallet ${wallet.address} is not an owner (${owner}) of the Oracle contract!`;
      throw new Error(errMsg);
    }
  
    const currentMaxFee = parseInt(`${gasData.maxFee}`);
    const currentPriorityFee = parseInt(`${gasData.maxPriorityFee}`);
  
    const isInRange = currentPriorityFee * Number(derivationThresold) / 100 <= Number(pastGasPrice)
      && currentPriorityFee * (100 + Number(derivationThresold)) / 100 >= Number(pastGasPrice);
  
    const isOutdated = Number(timestamp) <= (Date.now() / 1000) - Number(heartbeat) + (UPDATE_INTERVAL * 2);
  
    const shouldUpdate = !isInRange || isOutdated;
  
    if (!shouldUpdate) {
      console.log(`Skipping gas price update, current ${currentPriorityFee} recorded ${pastGasPrice}`);
      return;
    }
  
    const TxPriorityFeePerGas = parseUnits(`${currentPriorityFee}`, 'gwei') * 12n / 10n;
  
    await Oracle.setGasPrice(currentPriorityFee, {
      gasLimit: '50000',
      maxFeePerGas: parseUnits(`${currentMaxFee}`, 'gwei') * 2n + TxPriorityFeePerGas,
      maxPriorityFeePerGas: TxPriorityFeePerGas,
    }).then(t => t.wait());

    console.log(`Updated gas price to ${currentPriorityFee}`);
  } catch (err) {
    console.log('Failed to update gas price');
    console.log(err);
  }
}

async function start() {
  console.log('Starting gas price oracle');
  
  const staticNetwork = await new JsonRpcProvider(RPC_URL).getNetwork();
  const provider = new JsonRpcProvider(RPC_URL, staticNetwork, {
    staticNetwork,
  });
  provider.pollingInterval = 1000;
  
  wallet = Wallet.fromPhrase(MNEMONIC, provider);

  Oracle = GasPriceOracle__factory.connect(ORACLE_ADDRESS, wallet);

  Multicall = Multicall3__factory.connect('0xcA11bde05977b3631167028862bE2a173976CA11', provider);

  updateOracle();

  setInterval(updateOracle, UPDATE_INTERVAL * 1000);
}
start();