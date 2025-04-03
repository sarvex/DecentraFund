// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/EscrowManager.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        _mint(msg.sender, 1000000 ether);
    }
}

contract EscrowManagerTest is Test {
    EscrowManager public escrowManager;
    TestToken public testToken;
    
    address public owner = address(1);
    address public campaign = address(2);
    address public contributor1 = address(3);
    address public contributor2 = address(6);
    address public approver1 = address(4);
    address public approver2 = address(5);


    function setUp() public {
        vm.startPrank(owner);
        address[] memory initialApprovers = new address[](2);
        initialApprovers[0] = approver1;
        initialApprovers[1] = approver2;
        escrowManager = new EscrowManager(5, initialApprovers, 2); // 5% fee, 2 approvers
        testToken = new TestToken();
        escrowManager.whitelistToken(address(testToken));
        vm.stopPrank();
        
        // Initialize test campaign
        vm.prank(owner);
        escrowManager.initializeEscrow(
            owner, // Using owner as creator
            campaign,
            100 ether, // goal
            block.timestamp + 1 weeks, // deadline
            false // fixed funding
        );
        
        // Fund contributors
        vm.deal(contributor1, 200 ether);
        vm.deal(contributor2, 200 ether);
        testToken.transfer(contributor1, 1000 ether);
        testToken.transfer(contributor2, 1000 ether);
    }

    // Test initialization
    function test_InitialState() public view {
        assertEq(escrowManager.owner(), owner);
        assertEq(escrowManager.platformFeePercentage(), 5);
        assertTrue(escrowManager.isApprover(approver1));
        assertTrue(escrowManager.isApprover(approver2));
        assertEq(escrowManager.requiredApprovals(), 2);
    }

    // Test ETH deposits
    function test_ETH_Deposit() public {
        vm.prank(contributor1);
        escrowManager.deposit{value: 1 ether}(campaign);
        
        assertEq(escrowManager.getUserDeposit(campaign, contributor1), 1 ether);
        assertEq(escrowManager.getTotalDeposited(campaign), 1 ether);
    }

    // Test ERC20 deposits
    function test_ERC20_Deposit() public {
        uint256 amount = 100 ether;
        vm.startPrank(owner);
        testToken.approve(address(escrowManager), amount);
        escrowManager.depositERC20(address(testToken), campaign, amount);
        vm.stopPrank();

        assertEq(escrowManager.getUserERC20Deposit(address(testToken), campaign, owner), amount);
        assertEq(testToken.balanceOf(address(escrowManager)), amount);
    }

    // Test multiple contributors
    function test_MultipleContributors() public {
        vm.deal(contributor2, 2 ether);
        
        vm.prank(contributor1);
        escrowManager.deposit{value: 1 ether}(campaign);
        
        vm.prank(contributor2);
        escrowManager.deposit{value: 2 ether}(campaign);
        
        assertEq(escrowManager.getTotalDeposited(campaign), 3 ether);
    }

    // Test requestReleaseFunds function
    function test_RequestReleaseFunds() public {
        // Setup - deposit funds
        vm.prank(contributor1);
        escrowManager.deposit{value: 1 ether}(campaign);

        // Fast forward past deadline
        vm.warp(block.timestamp + 1 weeks + 1);

        // Request release
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);

        // Verify state changed
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), uint(EscrowManager.EscrowState.PENDING_RELEASE));
    }

    // Test approveReleaseFunds function
    function test_ApproveReleaseFunds() public {
        // Setup - deposit and request release
        vm.prank(contributor1);
        escrowManager.deposit{value: 1 ether}(campaign);
        
        // Fast forward past deadline
        vm.warp(block.timestamp + 1 weeks + 1);
        
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);

        // First approval
        vm.prank(approver1);
        escrowManager.approveReleaseFunds(campaign);
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), uint(EscrowManager.EscrowState.PENDING_RELEASE));

        // Second approval (but timelock not passed yet)
        vm.prank(approver2);
        escrowManager.approveReleaseFunds(campaign);
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), uint(EscrowManager.EscrowState.PENDING_RELEASE));

        // Fast forward past timelock
        vm.warp(block.timestamp + 2 days + 1);
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), uint(EscrowManager.EscrowState.RELEASED));
    }

    // Test failed campaign refund
    function test_FailedCampaignRefund() public {
        // Setup - deposit funds (but not enough to reach goal)
        vm.prank(contributor1);
        escrowManager.deposit{value: 50 ether}(campaign);

        // Fast forward past deadline
        vm.warp(block.timestamp + 1 weeks + 1);

        // Request release
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);

        // Approve release
        vm.prank(approver1);
        escrowManager.approveReleaseFunds(campaign);
        vm.prank(approver2);
        escrowManager.approveReleaseFunds(campaign);

        // Fast forward past timelock
        vm.warp(block.timestamp + 2 days + 1);

        // Verify state changed to REFUNDED
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), uint(EscrowManager.EscrowState.REFUNDED));

        // Test claim refund
        uint256 initialBalance = contributor1.balance;
        vm.prank(contributor1);
        escrowManager.claimRefund(campaign);
        assertEq(contributor1.balance, initialBalance + 50 ether);
    }

    // Test edge cases and failure scenarios
    function test_OnlyOwnerOrCampaignCanRequestRelease() public {
        // Should work when called by owner
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);
        
        // Should fail when called by random address
        vm.expectRevert("Not authorized");
        vm.prank(contributor1);
        escrowManager.requestReleaseFunds(campaign);
    }

    function test_OnlyApproversCanApprove() public {
        vm.expectRevert("Not an approver");
        vm.prank(contributor1);
        escrowManager.approveReleaseFunds(campaign);
    }

    // Test platform fee calculation
    function test_PlatformFeeCalculation() public {
        vm.prank(contributor1);
        escrowManager.deposit{value: 100 ether}(campaign);

        vm.warp(block.timestamp + 1 weeks + 1);
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);

        vm.prank(approver1);
        escrowManager.approveReleaseFunds(campaign);
        vm.prank(approver2);
        escrowManager.approveReleaseFunds(campaign);

        vm.warp(block.timestamp + 2 days + 1);

        uint256 initialOwnerBalance = owner.balance;
        assertEq(initialOwnerBalance, 0); // Owner starts with 0 ETH
        assertEq(owner.balance, 5 ether); // 5% of 100 ETH
    }

    // Test token whitelisting
    function test_TokenWhitelisting() public {
        TestToken newToken = new TestToken();
        vm.prank(owner);
        escrowManager.whitelistToken(address(newToken));
        
        assertTrue(escrowManager.isTokenWhitelisted(address(newToken)));
    }


    function test_CannotDepositZero() public {
        vm.expectRevert("Amount must be greater than 0");
        vm.prank(contributor1);
        escrowManager.deposit{value: 0}(campaign);
    }
}
