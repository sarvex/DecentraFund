const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdfundingCampaign", function () {
  let campaign;
  let factory;
  let token;
  let owner, contributor1, contributor2;

  before(async function () {
    [owner, contributor1, contributor2] = await ethers.getSigners();

    // Deploy factory
    const Factory = await ethers.getContractFactory("CrowdfundingFactory");
    factory = await Factory.deploy(5); // 5% platform fee

    // Deploy mock token
    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy();

    // Create a test campaign
    await factory.createCampaign(
      ethers.utils.parseEther("10"), // 10 ETH goal
      Math.floor(Date.now() / 1000) + 86400, // 1 day deadline
      "Test Campaign",
      "Test Description",
      "https://test.com/image.jpg",
      false // not flexible funding
    );

    const campaigns = await factory.allCampaigns();
    const Campaign = await ethers.getContractFactory("CrowdfundingCampaign");
    campaign = Campaign.attach(campaigns[0]);
  });

  describe("Deployment", function () {
    it("Should set the right creator", async function () {
      expect(await campaign.creator()).to.equal(owner.address);
    });

    it("Should set the right goal", async function () {
      expect(await campaign.goal()).to.equal(ethers.utils.parseEther("10"));
    });
  });

  describe("Contributions", function () {
    it("Should accept ETH contributions", async function () {
      const contribution = ethers.utils.parseEther("1");
      await expect(() =>
        contributor1.sendTransaction({
          to: campaign.address,
          value: contribution,
        })
      ).to.changeEtherBalance(campaign, contribution);
    });

    it("Should track contributors", async function () {
      expect(await campaign.contributors(contributor1.address)).to.be.true;
    });

    it("Should reject contributions after deadline", async function () {
      // Fast-forward time past deadline
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      await expect(
        contributor2.sendTransaction({
          to: campaign.address,
          value: ethers.utils.parseEther("1"),
        })
      ).to.be.revertedWith("Campaign is not active");
    });
  });

  describe("Voting", function () {
    it("Should allow contributors to vote", async function () {
      await expect(campaign.connect(contributor1).voteForRelease())
        .to.emit(campaign, "VotedForRelease")
        .withArgs(contributor1.address);
    });

    it("Should reject votes from non-contributors", async function () {
      await expect(
        campaign.connect(contributor2).voteForRelease()
      ).to.be.revertedWith("Not a contributor");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow creator to withdraw when goal met", async function () {
      // Reset time to before deadline
      await ethers.provider.send("evm_increaseTime", [-86401]);
      await ethers.provider.send("evm_mine");

      // Contribute enough to meet goal
      await contributor2.sendTransaction({
        to: campaign.address,
        value: ethers.utils.parseEther("9"),
      });

      // Get majority votes
      await campaign.connect(contributor1).voteForRelease();
      await campaign.connect(contributor2).voteForRelease();

      const creatorBalanceBefore = await ethers.provider.getBalance(
        owner.address
      );
      await campaign.connect(owner).withdrawFunds();
      const creatorBalanceAfter = await ethers.provider.getBalance(
        owner.address
      );

      expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);
    });
  });
});
