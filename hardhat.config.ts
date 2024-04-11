import fs from 'fs';
import path from 'path';
import process from 'process';
import { task, HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-storage-layout';
import 'hardhat-tracer';

task('flatten:all', 'Flatten all contracts each file under flatten directory')
  .setAction(async (taskArgs, hre) => {
    const allFilesAndFolders = fs.readdirSync('contracts', { recursive: true }) as Array<string>;
    const allFolders = allFilesAndFolders.filter(f => fs.statSync(path.join('contracts', f)).isDirectory());
    const allFiles = allFilesAndFolders.filter(f => !allFolders.includes(f));

    fs.rmSync('flatten', { force: true, recursive: true });
    fs.mkdirSync('flatten');
    allFolders.forEach(f => {
      fs.mkdirSync(path.join('flatten', f), { recursive: true });
    });

    await Promise.all(allFiles.map(async (f) => {
      const contract = path.join('contracts', f);
      const contractTo = path.join('flatten', f);
      try {
        const flatten = await hre.run('flatten:get-flattened-sources', { files: [contract] });
        fs.writeFileSync(contractTo, flatten);
        console.log(`Wrote ${contractTo} contract`);
      } catch (e) {
        // Catching circular contracts
        console.log(`Failed to write ${contractTo} contract`);
        console.log(e);
      }
    }));
  });

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [
      {
        version: '0.8.25',
        settings: {
          evmVersion: 'paris',
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    develop: {
      url: process.env.RPC_URL || '',
      accounts: {
        mnemonic: process.env.MNEMONIC || 'test test test test test test test test test test test junk',
        initialIndex: Number(process.env.MNEMONIC_INDEX) || 0,
      },
    },
    polygon: {
      url: process.env.RPC_URL || 'https://polygon-mainnet.chainnodes.org/d692ae63-0a7e-43e0-9da9-fe4f4cc6c607',
      accounts: {
        mnemonic: process.env.MNEMONIC || 'test test test test test test test test test test test junk',
        initialIndex: Number(process.env.MNEMONIC_INDEX) || 0,
      },
    },
    hardhat: {},
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN 
  },
  sourcify: {
    enabled: true
  }
};

export default config;
