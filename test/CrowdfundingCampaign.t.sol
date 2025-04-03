// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/CrowdfundingCampaign.sol";
import "../test/mocks/MockERC20.sol";

contract CrowdfundingCampaignTest is Test {
    CrowdfundingCampaign campaign;
    MockERC20 token;
    address creator = address(0x1000); // Changed from precompile address to regular address
    address contributor1 = address(2);
    address contributor2 = address(3);
    uint256 goal = 10 ether;
    uint256 deadline;
    uint256 platformFee = 5; // 5%
    bool isFlexible = false;
    string title = "Test Campaign";
    string desc = "Test Description";
    string image = "test.png";

    function setUp() public {
        deadline = block.timestamp + 30 days;
        token = new MockERC20();
        campaign = new CrowdfundingCampaign(
            creator,
            goal,
            deadline,
            platformFee,
            isFlexible,
            title,
            desc,
            image
        );

        // Fund test accounts
        vm.deal(contributor1, 20 ether);
        vm.deal(contributor2, 20 ether);
        token.mint(contributor1, 1000 ether);
        token.mint(contributor2, 1000 ether);
    }

    function testInitialState() public view {
        assertEq(campaign.creator(), creator);
        assertEq(campaign.goal(), goal);
        assertEq(campaign.deadline(), deadline);
        assertEq(campaign.platformFeePercentage(), platformFee);
        assertEq(campaign.isFlexibleFunding(), isFlexible);
        assertEq(campaign.title(), title);
        assertEq(campaign.description(), desc);
        assertEq(campaign.imageURL(), image);
        assertEq(campaign.getStatus(), "Active");
    }

    function testEthContribution() public {
        uint256 tierIndex = 0;
        uint256 minAmount = 1 ether;
        string memory reward = "Basic Tier";
        
        // Create tier
        vm.prank(creator);
        campaign.createTier(minAmount, reward, 100);

        // Contribute ETH
        vm.prank(contributor1);
        campaign.contribute{value: 1 ether}(tierIndex);

        assertEq(campaign.contributions(contributor1), 1 ether);
        assertEq(campaign.totalRaised(), 1 ether);
        assertEq(campaign.getContributorCount(), 1);
        assertEq(campaign.backerTier(contributor1), tierIndex);
    }

    function testERC20Contribution() public {
        uint256 tierIndex = 0;
        uint256 minAmount = 1 ether;
        string memory reward = "Basic Tier";
        
        // Create tier
        vm.prank(creator);
        campaign.createTier(minAmount, reward, 100);

        // Approve and contribute ERC20
        vm.prank(contributor1);
        token.approve(address(campaign), 1 ether);

        vm.prank(contributor1);
        campaign.contributeERC20(address(token), 1 ether, tierIndex);

        assertEq(campaign.erc20Contributions(address(token), contributor1), 1 ether);
        assertEq(campaign.erc20TotalContributions(address(token)), 1 ether);
        assertEq(campaign.backerTier(contributor1), tierIndex);
    }

    function testSuccessfulCampaignWithdrawal() public {
        // Setup campaign with 2 contributors
        vm.prank(creator);
        campaign.createTier(1 ether, "Tier", 100);

        vm.prank(contributor1);
        campaign.contribute{value: 6 ether}(0);

        vm.prank(contributor2);
        campaign.contribute{value: 5 ether}(0);

        // Fast forward past deadline
        vm.warp(deadline + 1);
        assertEq(campaign.getStatus(), "Successful");

        // Vote for release
        vm.prank(contributor1);
        campaign.vote(false, true);

        vm.prank(contributor2);
        campaign.vote(false, true);

        // Request and execute withdrawal
        vm.prank(creator);
        campaign.requestWithdrawal();

        vm.warp(block.timestamp + 2 days + 1);
        
        uint256 creatorBalanceBefore = creator.balance;
        vm.prank(creator);
        campaign.withdrawFunds();

        uint256 expectedFee = (11 ether * platformFee) / 100;
        uint256 expectedCreatorAmount = 11 ether - expectedFee;
        assertEq(creator.balance - creatorBalanceBefore, expectedCreatorAmount);
        assertTrue(campaign.fundsWithdrawn());
    }

    function test_RevertWhen_CampaignFails_ThenRefund() public {
        vm.prank(creator);
        campaign.createTier(1 ether, "Tier", 100);

        vm.prank(contributor1);
        campaign.contribute{value: 4 ether}(0);

        // Fast forward past deadline
        vm.warp(deadline + 1);
        assertEq(campaign.getStatus(), "Failed");

        // Claim refund
        uint256 balanceBefore = contributor1.balance;
        vm.prank(contributor1);
        campaign.claimRefund();

        assertEq(contributor1.balance - balanceBefore, 4 ether);
        assertEq(campaign.contributions(contributor1), 0);
    }

    function testCampaignExtension() public {
        vm.prank(creator);
        campaign.createTier(1 ether, "Tier", 100);

        vm.prank(contributor1);
        campaign.contribute{value: 1 ether}(0);

        vm.prank(contributor2);
        campaign.contribute{value: 1 ether}(0);

        // Vote for extension
        vm.prank(contributor1);
        campaign.vote(true, false);

        vm.prank(contributor2);
        campaign.vote(true, false);

        // Request and execute extension
        uint256 newDeadline = deadline + 30 days;
        vm.prank(creator);
        campaign.requestExtension(newDeadline);

        vm.warp(block.timestamp + 2 days + 1);
        vm.prank(creator);
        campaign.extendDeadline(newDeadline);

        assertEq(campaign.deadline(), newDeadline);
        assertEq(campaign.votesForExtension(), 0);
    }

    // Additional edge case tests would go here...
}
