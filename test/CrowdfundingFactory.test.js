const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdfundingFactory", function () {
  let factory;
  let owner, user1, user2;

  before(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CrowdfundingFactory");
    factory = await Factory.deploy(5); // 5% platform fee
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("Should set the platform fee", async function () {
      expect(await factory.platformFeePercentage()).to.equal(5);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create new campaigns", async function () {
      await expect(
        factory
          .connect(user1)
          .createCampaign(
            ethers.utils.parseEther("10"),
            Math.floor(Date.now() / 1000) + 86400,
            "Test Campaign",
            "Test Description",
            "https://test.com/image.jpg",
            false
          )
      ).to.emit(factory, "CampaignCreated");
    });

    it("Should track created campaigns", async function () {
      const campaigns = await factory.allCampaigns();
      expect(campaigns.length).to.equal(1);
    });

    it("Should track user campaigns", async function () {
      const userCampaigns = await factory.getUserCampaigns(user1.address);
      expect(userCampaigns.length).to.equal(1);
    });

    it("Should reject invalid parameters", async function () {
      await expect(
        factory.connect(user1).createCampaign(
          0, // invalid goal
          Math.floor(Date.now() / 1000) + 86400,
          "Invalid Campaign",
          "Invalid Description",
          "https://test.com/image.jpg",
          false
        )
      ).to.be.revertedWith("Goal must be > 0");
    });
  });

  describe("Platform Fees", function () {
    it("Should allow owner to change fee", async function () {
      await expect(factory.connect(owner).setPlatformFee(3))
        .to.emit(factory, "PlatformFeeChanged")
        .withArgs(3);
    });

    it("Should reject non-owner fee changes", async function () {
      await expect(factory.connect(user1).setPlatformFee(3)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should reject invalid fees", async function () {
      await expect(
        factory.connect(owner).setPlatformFee(11)
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });
  });
});
