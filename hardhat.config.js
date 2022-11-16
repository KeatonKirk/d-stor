require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: process.env.GOERLI_API_URL,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    },
    polygon: {
      url: process.env.POLYGON_API_URL,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    }
  }
};
