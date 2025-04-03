// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CrowdfundingFactory.sol";

contract CrowdfundingFactoryTest is Test {
    CrowdfundingFactory factory;
    address owner = address(1);
    address user1 = address(2);
    address user2 = address(3);

    function setUp() public {
        vm.prank(owner);
        factory = new CrowdfundingFactory(5); // 5% platform fee
    }

    function testDeployment() public view {
        assertEq(factory.owner(), owner);
        assertEq(factory.platformFeePercentage(), 5);
    }

    function testCampaignCreation() public {
        vm.prank(user1);
        address campaign = factory.createCampaign(
            10 ether,
            block.timestamp + 1 days,
            "Test Campaign",
            "Test Description",
            "https://test.com/image.jpg",
            false
        );

        address[] memory campaigns = factory.getUserCampaigns(user1);
        assertEq(campaigns.length, 1);
        assertTrue(campaign != address(0));
    }

    function testCampaignCreationWithZeroGoal() public {
        vm.prank(user1);
        vm.expectRevert("Goal must be > 0");
        factory.createCampaign(
            0,
            block.timestamp + 1 days,
            "Invalid Campaign",
            "Description",
            "https://test.com/image.jpg",
            false
        );
    }

    function testCampaignCreationWithPastDeadline() public {
        vm.prank(user1);
        vm.expectRevert("Deadline must be in the future");
        factory.createCampaign(
            10 ether,
            block.timestamp - 1,
            "Invalid Campaign",
            "Description",
            "https://test.com/image.jpg",
            false
        );
    }

    function testFeeChange() public {
        vm.prank(owner);
        factory.setPlatformFee(3);
        assertEq(factory.platformFeePercentage(), 3);
    }

    function testFeeChangeFromNonOwner() public {
        vm.prank(user1);
        vm.expectRevert("Only owner can change fee");
        factory.setPlatformFee(3);
    }

    function testFeeChangeInvalidValue() public {
        vm.prank(owner);
        vm.expectRevert("Fee cannot exceed 10%");
        factory.setPlatformFee(11);
    }

    function testGetAllCampaigns() public {
        vm.prank(user1);
        address campaign = factory.createCampaign(
            10 ether,
            block.timestamp + 1 days,
            "Test Campaign",
            "Test Description",
            "https://test.com/image.jpg",
            false
        );
        
        address[] memory campaigns = factory.getAllCampaigns();
        assertEq(campaigns.length, 1);
        assertEq(campaigns[0], campaign);
    }

    function testGetUserCampaigns() public {
        vm.prank(user1);
        address campaign = factory.createCampaign(
            10 ether,
            block.timestamp + 1 days,
            "Test Campaign",
            "Test Description",
            "https://test.com/image.jpg",
            false
        );
        
        address[] memory campaigns = factory.getUserCampaigns(user1);
        assertEq(campaigns.length, 1);
        assertEq(campaigns[0], campaign);
    }
}
