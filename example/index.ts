import { JsonRpcProvider, BaseContract, Network, FetchUrlFeeDataNetworkPlugin, parseUnits } from 'ethers';
import { GasPriceOracle, GasPriceOracle__factory, Multicall3, Multicall3__factory } from '../typechain-types';
import 'dotenv/config';

const ORACLE_ADDRESS = '0xF81A8D8D3581985D3969fe53bFA67074aDFa8F3C';

const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

const RPC_URL = process.env.RPC_URL || 'https://polygon-mainnet.chainnodes.org/d692ae63-0a7e-43e0-9da9-fe4f4cc6c607';

const GAS_STATION = process.env.GAS_STATION || 'https://gasstation.polygon.technology/v2';

export interface Call3 {
  contract: BaseContract;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[];
  allowFailure?: boolean;
}

export async function multicall(Multicall: Multicall3, calls: Call3[]) {
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

// caching to improve performance
const oracleMapper = new Map();
const multicallMapper = new Map();

export function getGasOraclePlugin(networkKey: string, gasStation: string) {
  return new FetchUrlFeeDataNetworkPlugin(gasStation, async (fetchFeeData, provider, request) => {
    if (!oracleMapper.has(networkKey)) {
      oracleMapper.set(networkKey, GasPriceOracle__factory.connect(ORACLE_ADDRESS, provider));
    }
    if (!multicallMapper.has(networkKey)) {
      multicallMapper.set(networkKey, Multicall3__factory.connect(MULTICALL_ADDRESS, provider));
    }
    const Oracle = oracleMapper.get(networkKey) as GasPriceOracle;
    const Multicall = multicallMapper.get(networkKey) as Multicall3;

    const [timestamp, heartbeat, feePerGas, priorityFeePerGas] = await multicall(Multicall, [
      {
        contract: Oracle,
        name: 'timestamp'
      },
      {
        contract: Oracle,
        name: 'heartbeat'
      },
      {
        contract: Oracle,
        name: 'maxFeePerGas'
      },
      {
        contract: Oracle,
        name: 'maxPriorityFeePerGas'
      },
    ]);

    const isOutdated = Number(timestamp) <= (Date.now() / 1000) - Number(heartbeat);

    if (!isOutdated) {
      const maxPriorityFeePerGas = priorityFeePerGas * 13n / 10n;
      const maxFeePerGas = feePerGas * 2n + maxPriorityFeePerGas;

      console.log(`Fetched from oracle: ${JSON.stringify({
        gasPrice: feePerGas.toString(),
        maxFeePerGas: feePerGas.toString(),
        maxPriorityFeePerGas: priorityFeePerGas.toString(),
      })}`);

      return {
        gasPrice: maxFeePerGas,
        maxFeePerGas,
        maxPriorityFeePerGas
      };
    }

    // Prevent Cloudflare from blocking our request in node.js
    request.setHeader('User-Agent', 'ethers');

    const [ { bodyJson: { fast }}, { gasPrice } ] = await Promise.all([
      request.send(), fetchFeeData()
    ]);

    console.log(`Fetched from gasStation: ${JSON.stringify({
      gasPrice: gasPrice ? gasPrice.toString() : undefined,
      maxFeePerGas: parseUnits(`${fast.maxFee}`, 9).toString(),
      maxPriorityFeePerGas: parseUnits(`${fast.maxPriorityFee}`, 9).toString(),
    })}`);

    return {
      gasPrice,
      maxFeePerGas: parseUnits(`${fast.maxFee}`, 9),
      maxPriorityFeePerGas: parseUnits(`${fast.maxPriorityFee}`, 9),
    };
  });
}

export async function start() {
  const previousNetwork = await new JsonRpcProvider(RPC_URL).getNetwork();

  const network = new Network(previousNetwork.name, previousNetwork.chainId);

  network.attachPlugin(getGasOraclePlugin(`${previousNetwork.chainId}_${RPC_URL}`, GAS_STATION));

  const provider = new JsonRpcProvider(RPC_URL, network, { staticNetwork: network });
  provider.pollingInterval = 1000;

  provider.on('block', async () => {
    console.log(await provider.getFeeData());
  });
}
start();