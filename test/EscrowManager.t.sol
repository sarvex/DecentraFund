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
    address public campaign = address(100);
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
            owner,  // Changed to owner as creator
            campaign,
            100 ether,
            block.timestamp + 1 weeks,
            false
        );

        
               
        // Fund contributors
        vm.deal(contributor1, 200 ether);
        vm.deal(contributor2, 200 ether);
        vm.prank(owner);
        testToken.transfer(contributor1, 100 ether);
        vm.prank(owner);
        testToken.transfer(contributor2, 100 ether);
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
        vm.startPrank(contributor1);
        testToken.approve(address(escrowManager), amount);
        escrowManager.depositERC20(address(testToken), campaign, amount);
        vm.stopPrank();

        assertEq(escrowManager.getUserERC20Deposit(address(testToken), campaign, contributor1), amount);
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
        escrowManager.deposit{value: 100 ether}(campaign);

        // Fast forward past deadline
        vm.warp(block.timestamp + 1 weeks + 1);

        // Request release
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);

        // Verify state changed to PENDING_RELEASE (1)
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), 1);
    }

    // Test approveReleaseFunds function
    function test_ApproveReleaseFunds() public {
        // Setup - deposit and request release
        vm.prank(contributor1);
        escrowManager.deposit{value: 100 ether}(campaign);
        
        // Fast forward past deadline
        vm.warp(block.timestamp + 1 weeks + 1);
        
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);

        // First approval - state should remain PENDING_RELEASE (1)
        vm.prank(approver1);
        escrowManager.approveReleaseFunds(campaign);
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), 1);

        // Fast forward past timelock
        vm.warp(block.timestamp + 2 days + 1);

        // Second approval - state should transition to RELEASED (2)
        vm.prank(approver2);
        escrowManager.approveReleaseFunds(campaign);
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), 2);
    }

    function test_ReleaseFunds() public {
        // Setup - deposit funds
        vm.prank(contributor1);
        escrowManager.deposit{value: 100 ether}(campaign);

        // Complete approval process
        vm.warp(block.timestamp + 1 weeks + 1);
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);
        vm.prank(approver1);
        escrowManager.approveReleaseFunds(campaign);
        vm.warp(block.timestamp + 2 days + 1);
        vm.prank(approver2);
        escrowManager.approveReleaseFunds(campaign);

        // Track balances before release
        uint256 initialCreatorBalance = campaign.balance;
        uint256 initialOwnerBalance = owner.balance;
        uint256 initialEscrowBalance = address(escrowManager).balance;
        
        vm.prank(owner);
        escrowManager.releaseFunds(campaign);
        
        // Verify funds were distributed correctly (95% to creator, 5% to owner)
        assertEq(campaign.balance, initialCreatorBalance + 95 ether, "Creator should receive 95%");
        assertEq(owner.balance, initialOwnerBalance + 5 ether, "Owner should receive 5% fee");
        assertEq(address(escrowManager).balance, initialEscrowBalance - 100 ether, "Escrow should be emptied");
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), 0, "Escrow should be reset to ACTIVE");
    }

    function test_OnlyOwnerCanReleaseFunds() public {
        test_ApproveReleaseFunds();
        
        vm.expectRevert("Only owner");
        vm.prank(contributor1);
        escrowManager.releaseFunds(campaign);
    }

    function test_CannotReleaseTwice() public {
        test_ApproveReleaseFunds();
        
        vm.prank(owner);
        escrowManager.releaseFunds(campaign);
        
        vm.expectRevert("Not ready for release");
        vm.prank(owner);
        escrowManager.releaseFunds(campaign);
    }

    function test_ReleaseWithZeroFunds() public {
        // Setup approvals without deposits
        vm.warp(block.timestamp + 1 weeks + 1);
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);
        
        vm.prank(approver1);
        escrowManager.approveReleaseFunds(campaign);
        vm.prank(approver2);
        escrowManager.approveReleaseFunds(campaign);
        
        vm.expectRevert("Not ready for release");
        vm.prank(owner);
        escrowManager.releaseFunds(campaign);
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
        
        // Fast forward past timelock
        vm.warp(block.timestamp + 2 days + 1);
        
        vm.prank(approver2);
        escrowManager.approveReleaseFunds(campaign);

        // Verify state changed to REFUNDED (3)

        assertEq(uint(escrowManager.getEscrowStatus(campaign)), 3);

        // Test claim refund
        uint256 initialBalance = contributor1.balance;
        vm.prank(contributor1);
        escrowManager.claimRefund(campaign);
        assertEq(contributor1.balance, initialBalance + 50 ether);
    }

    // Test edge cases and failure scenarios
    function test_OnlyOwnerOrCampaignCanRequestRelease() public {
        // Fast forward past deadline
        vm.warp(block.timestamp + 1 weeks + 1);

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

    function test_TimelockEnforcement() public {
        // Setup - deposit funds
        vm.prank(contributor1);
        escrowManager.deposit{value: 100 ether}(campaign);

        // Fast forward past deadline
        vm.warp(block.timestamp + 1 weeks + 1);

        // Request release
        vm.prank(owner);
        escrowManager.requestReleaseFunds(campaign);

        // First approval - state should remain PENDING_RELEASE (1)
        vm.prank(approver1);
        escrowManager.approveReleaseFunds(campaign);
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), 1);

        // Fast forward past timelock
        vm.warp(block.timestamp + 2 days + 1);

        // Second approval - state should transition to RELEASED (2)
        vm.prank(approver2);
        escrowManager.approveReleaseFunds(campaign);
        assertEq(uint(escrowManager.getEscrowStatus(campaign)), 2);
    }

function test_PlatformFeeCalculation() public {
    // 1. Setup - Give the owner 0 ETH to start with
    vm.deal(owner, 0);
    vm.deal(contributor1, 100 ether);
    
    // 2. Make the deposit
    vm.prank(contributor1);
    escrowManager.deposit{value: 100 ether}(campaign);
    
    // 3. Complete the release process
    vm.warp(block.timestamp + 1 weeks + 1);
    vm.prank(owner);
    escrowManager.requestReleaseFunds(campaign);
    
    vm.prank(approver1);
    escrowManager.approveReleaseFunds(campaign);
    
    vm.warp(block.timestamp + 2 days + 1);
    vm.prank(approver2);
    escrowManager.approveReleaseFunds(campaign);

    // 4. Get the owner's balance BEFORE release
    uint256 ownerBalanceBeforeRelease = owner.balance;
    
    // 5. Release funds
    vm.prank(owner);
    escrowManager.releaseFunds(campaign);
    
    // 6. Verify the owner received EXACTLY 5 ETH
    assertEq(
        owner.balance - ownerBalanceBeforeRelease, 
        5 ether, 
        "Owner should receive exactly 5 ETH (5% of 100 ETH)"
    );
    
    // 7. Verify the campaign received 95 ETH
    assertEq(
        campaign.balance, 
        95 ether, 
        "Campaign should receive 95 ETH (95% of 100 ETH)"
    );
    
    // 8. Verify the escrow is empty
    assertEq(
        address(escrowManager).balance, 
        0, 
        "Escrow should be empty after release"
    );
}
    // Test token whitelisting
    function test_TokenWhitelisting() public {
        TestToken newToken = new TestToken();
        vm.prank(owner);
        escrowManager.whitelistToken(address(newToken));
        
        assertTrue(escrowManager.whitelistedTokens(address(newToken)));
    }

    function test_CannotDepositZero() public {
        vm.expectRevert("Must deposit ETH");
        vm.prank(contributor1);
        escrowManager.deposit{value: 0}(campaign);
    }
}
