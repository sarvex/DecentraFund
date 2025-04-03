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
}
