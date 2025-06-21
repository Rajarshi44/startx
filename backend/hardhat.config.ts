import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Check for required environment variables only for network deployments
const INFURA_API_KEY = process.env.INFURA_API_KEY || "dummy_key";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 84532,
    },
    amoy: {
      url: `https://polygon-amoy.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 43113,
      gasPrice: 225000000000,
      timeout: 60000 // Increase timeout to 60 seconds
    },
  },
};

export default config;