const { ethers } = require("hardhat");

async function getCurrentBlockTimestamp() {
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  return block.timestamp;
}

async function increaseTime(seconds) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine");
}

async function getETHBalance(address) {
  return await ethers.provider.getBalance(address);
}

module.exports = {
  getCurrentBlockTimestamp,
  increaseTime,
  getETHBalance,
};
