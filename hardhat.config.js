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
    ropsten: {
      url: process.env.ROPSTEN_API_URL,
      accounts: [process.env.ROPSTEN_PRIVATE_KEY]
    }
  }
};
