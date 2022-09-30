// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const MintAccessNft = await hre.ethers.getContractFactory("MintAccessNft");
  const mintAccessNft = await MintAccessNft.deploy();

  await mintAccessNft.deployed();

  const tx = await mintAccessNft.giveAccess();
  const receipt = await tx.wait();

  for (const event of receipt.events) {
    console.log(`Event ${event.event} with tokenID ${event.args.tokenId}`)
  }

  console.log("Contract deployed address is:", mintAccessNft.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
