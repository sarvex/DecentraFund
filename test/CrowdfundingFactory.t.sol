// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/CrowdfundingFactory.sol";

contract CrowdfundingFactoryTest is Test {
    CrowdfundingFactory factory;
    address owner = address(0x1000);
    address user1 = address(0x2000);
    address user2 = address(0x3000);
    uint256 initialFee = 5; // 5%

    function setUp() public {
        vm.prank(owner);
        factory = new CrowdfundingFactory(initialFee);
    }

    function testInitialState() public view {
        assertEq(factory.owner(), owner);
        assertEq(factory.platformFeePercentage(), initialFee);
        assertEq(factory.getTotalCampaigns(), 0);
    }

    function testCreateCampaign() public {
        vm.prank(user1);
        address campaign = factory.createCampaign(
            10 ether,
            block.timestamp + 30 days,
            "Test Campaign",
            "Test Description",
            "test.png",
            false
        );

        assertTrue(campaign != address(0));
        assertEq(factory.getTotalCampaigns(), 1);
        assertEq(factory.getUserCampaigns(user1).length, 1);
        assertEq(factory.getUserCampaigns(user1)[0], campaign);
    }

    function test_RevertWhen_CreateCampaign_InvalidGoal() public {
        vm.prank(user1);
        vm.expectRevert("Goal must be > 0");
        factory.createCampaign(
            0,
            block.timestamp + 30 days,
            "Test Campaign",
            "Test Description",
            "test.png",
            false
        );
    }

    function test_RevertWhen_CreateCampaign_PastDeadline() public {
        vm.prank(user1);
        vm.expectRevert("Deadline must be in future");
        factory.createCampaign(
            10 ether,
            block.timestamp - 1,
            "Test Campaign",
            "Test Description",
            "test.png",
            false
        );
    }

    function testChangePlatformFee() public {
        uint256 newFee = 7;
        vm.prank(owner);
        factory.setPlatformFee(newFee);

        assertEq(factory.platformFeePercentage(), newFee);
    }

    function test_RevertWhen_ChangePlatformFee_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        factory.setPlatformFee(7);
    }

    function test_RevertWhen_ChangePlatformFee_TooHigh() public {
        vm.prank(owner);
        vm.expectRevert("Fee cannot exceed 10%");
        factory.setPlatformFee(11);
    }

    function testRecordSuccessfulCampaign() public {
        // Create a campaign
        vm.prank(user1);
        address campaign = factory.createCampaign(
            10 ether,
            block.timestamp + 30 days,
            "Test Campaign",
            "Test Description",
            "test.png",
            false
        );

        // Simulate campaign success
        vm.prank(campaign);
        factory.recordSuccessfulCampaign(10 ether, 5);

        (, uint256 totalRaised, uint256 totalSuccessful, uint256 totalContributors) = factory.stats();
        assertEq(totalRaised, 10 ether);
        assertEq(totalSuccessful, 1);
        assertEq(totalContributors, 5);
    }

    function testWithdrawFees() public {
        // Simulate fees being collected
        vm.deal(address(factory), 1 ether);

        uint256 ownerBalanceBefore = owner.balance;
        vm.prank(owner);
        factory.withdrawFees();

        assertEq(owner.balance - ownerBalanceBefore, 1 ether);
        assertEq(address(factory).balance, 0);
    }

    function test_RevertWhen_WithdrawFees_NotOwner() public {
        vm.deal(address(factory), 1 ether);
        vm.prank(user1);
        vm.expectRevert();
        factory.withdrawFees();
    }
}
