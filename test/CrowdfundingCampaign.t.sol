// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CrowdfundingCampaign.sol";
import "../src/CrowdfundingFactory.sol";
import "./mocks/MockERC20.sol";

contract CrowdfundingCampaignTest is Test {
    CrowdfundingCampaign campaign;
    CrowdfundingFactory factory;
    MockERC20 token;
    address owner = address(1);
    address contributor1 = address(2);
    address contributor2 = address(3);

    function setUp() public {
        vm.startPrank(owner);
        factory = new CrowdfundingFactory(5); // 5% platform fee
        token = new MockERC20();
        
        factory.createCampaign(
            10 ether, // 10 ETH goal
            block.timestamp + 1 days, // 1 day deadline
            "Test Campaign",
            "Test Description",
            "https://test.com/image.jpg",
            false // not flexible funding
        );
        
        address campaignAddress = factory.getUserCampaigns(owner)[0];
        campaign = CrowdfundingCampaign(payable(campaignAddress));
        vm.stopPrank();

        // Fund test contributors
        vm.deal(contributor1, 20 ether);
        vm.deal(contributor2, 20 ether);
        // Mint tokens directly to contributors to avoid insufficient balance
        token.mint(contributor1, 100 ether);
        token.mint(contributor2, 100 ether);
    }

    function testDeployment() public view {
        assertEq(campaign.creator(), owner);
        assertEq(campaign.goal(), 10 ether);
    }

    function testEthContributions() public {
        vm.deal(contributor1, 1 ether);
        vm.prank(contributor1);
        (bool success,) = address(campaign).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(campaign).balance, 1 ether);
    }

    function testVoting() public {
        // First contribute
        vm.deal(contributor1, 1 ether);
        vm.prank(contributor1);
        (bool success,) = address(campaign).call{value: 1 ether}("");
        assertTrue(success);

        // Fast forward past deadline
        vm.warp(block.timestamp + 2 days);

        // Test voting
        vm.prank(contributor1);
        campaign.voteForRelease();
        assertTrue(campaign.votes(contributor1));
    }

    function testFlexibleFundingSuccess() public {
        // Create flexible funding campaign
        vm.startPrank(owner);
        factory.createCampaign(
            10 ether,
            block.timestamp + 1 days,
            "Flexible Campaign",
            "Test",
            "https://test.com/image.jpg",
            true // flexible funding
        );
        address flexCampaignAddr = factory.getUserCampaigns(owner)[1];
        CrowdfundingCampaign flexCampaign = CrowdfundingCampaign(payable(flexCampaignAddr));
        vm.stopPrank();

        // Contribute but don't meet goal
        vm.prank(contributor1);
        (bool success,) = address(flexCampaign).call{value: 5 ether}("");
        assertTrue(success);

        // Fast forward and vote
        vm.warp(block.timestamp + 2 days);
        vm.prank(contributor1);
        flexCampaign.voteForRelease();

        // Should be able to withdraw despite not meeting goal
        vm.prank(owner);
        flexCampaign.withdrawFunds();
    }


    function testMultipleContributions() public {
        // First contribution
        vm.prank(contributor1);
        (bool success,) = address(campaign).call{value: 1 ether}("");
        assertTrue(success);

        // Second contribution
        vm.prank(contributor1);
        (bool success2,) = address(campaign).call{value: 2 ether}("");
        assertTrue(success2);

        assertEq(campaign.contributions(contributor1), 3 ether);
    }

    function test_RevertWhen_NotEnoughVotes() public {
        // Contribute but don't vote
        vm.prank(contributor1);
        (bool success,) = address(campaign).call{value: 1 ether}("");
        assertTrue(success);

        vm.warp(block.timestamp + 2 days);

        // Should fail to withdraw without votes
        vm.prank(owner);
        vm.expectRevert("Not enough votes");
        campaign.withdrawFunds();
    }

    event Contributed(address indexed contributor, uint256 amount);
    event VotedForRelease(address indexed voter);

    function testEventEmissions() public {
        // Test Contributed event
        vm.expectEmit(true, true, false, true);
        emit Contributed(contributor1, 1 ether);
        vm.prank(contributor1);
        (bool success,) = address(campaign).call{value: 1 ether}("");
        assertTrue(success);

        // Test VotedForRelease event
        vm.warp(block.timestamp + 2 days);
        vm.expectEmit(true, false, false, false);
        emit VotedForRelease(contributor1);
        vm.prank(contributor1);
        campaign.voteForRelease();
    }
}
