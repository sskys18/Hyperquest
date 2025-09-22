require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const { RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    local: {
      url: 'http://127.0.0.1:8545'
    },
    custom: RPC_URL
      ? {
          url: RPC_URL,
          accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
        }
      : undefined
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || ''
  }
};

