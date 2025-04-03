// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EscrowManager is ReentrancyGuard {
    enum EscrowState { ACTIVE, PENDING_RELEASE, RELEASED, REFUNDED }
    
    struct CampaignEscrow {
        address creator;
        address campaign;
        uint256 goal;
        uint256 deadline;
        uint256 totalDeposited;
        EscrowState state;
        bool isFlexibleFunding;
        uint256 releaseRequestTime;
        uint256 approvalCount;
    }
    
    address public immutable owner;
    uint256 public platformFeePercentage;
    address[] public approvers;
    uint256 public requiredApprovals;
    
    mapping(address => bool) public isApprover;
    mapping(address => mapping(address => bool)) public hasApproved;
    mapping(address => CampaignEscrow) public escrows;
    mapping(address => mapping(address => uint256)) public ethDeposits;
    mapping(address => mapping(address => mapping(address => uint256))) public erc20Deposits;
    mapping(address => bool) public whitelistedTokens;

    uint256 public constant TIMELOCK_DURATION = 2 days;

    event FundsDeposited(address indexed campaign, address indexed depositor, uint256 amount);
    event ERC20Deposited(address indexed token, address indexed campaign, address indexed depositor, uint256 amount);
    event FundsReleaseRequested(address indexed campaign);
    event FundsReleaseApproved(address indexed campaign, address indexed approver);
    event FundsReleased(address indexed campaign, uint256 creatorAmount, uint256 platformFee);
    event FundsRefunded(address indexed campaign, address indexed recipient, uint256 amount);
    event ERC20Refunded(address indexed token, address indexed campaign, address indexed recipient, uint256 amount);
    event TokenWhitelisted(address indexed token);
    event TokenRemovedFromWhitelist(address indexed token);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyCampaignOrOwner(address _campaign) {
        require(msg.sender == _campaign || msg.sender == owner, "Not authorized");
        _;
    }

    constructor(uint256 _platformFeePercentage, address[] memory _initialApprovers, uint256 _requiredApprovals) {
        require(_platformFeePercentage <= 10, "Fee too high");
        require(_requiredApprovals > 0, "Approvals required");
        require(_requiredApprovals <= _initialApprovers.length, "Too many required approvals");
        
        owner = msg.sender;
        platformFeePercentage = _platformFeePercentage;
        requiredApprovals = _requiredApprovals;
        
        for (uint i = 0; i < _initialApprovers.length; i++) {
            approvers.push(_initialApprovers[i]);
            isApprover[_initialApprovers[i]] = true;
        }
    }

    function whitelistToken(address _token) external onlyOwner {
        require(!whitelistedTokens[_token], "Already whitelisted");
        whitelistedTokens[_token] = true;
        emit TokenWhitelisted(_token);
    }

    function removeTokenFromWhitelist(address _token) external onlyOwner {
        require(whitelistedTokens[_token], "Not whitelisted");
        whitelistedTokens[_token] = false;
        emit TokenRemovedFromWhitelist(_token);
    }

    function initializeEscrow(
        address _creator,
        address _campaign,
        uint256 _goal,
        uint256 _deadline,
        bool _isFlexibleFunding
    ) external onlyOwner {
        require(escrows[_campaign].creator == address(0), "Escrow exists");
        require(_deadline > block.timestamp, "Deadline passed");
        
        escrows[_campaign] = CampaignEscrow({
            creator: _creator,
            campaign: _campaign,
            goal: _goal,
            deadline: _deadline,
            totalDeposited: 0,
            state: EscrowState.ACTIVE,
            isFlexibleFunding: _isFlexibleFunding,
            releaseRequestTime: 0,
            approvalCount: 0
        });
    }

    function deposit(address _campaign) external payable nonReentrant {
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.creator != address(0), "Invalid campaign");
        require(escrow.state == EscrowState.ACTIVE, "Not active");
        require(block.timestamp < escrow.deadline, "Campaign ended");
        require(msg.value > 0, "Must deposit ETH");
        
        ethDeposits[_campaign][msg.sender] += msg.value;
        escrow.totalDeposited += msg.value;
        
        emit FundsDeposited(_campaign, msg.sender, msg.value);
    }

    function depositERC20(
        address _token,
        address _campaign, 
        uint256 _amount
    ) external nonReentrant {
        require(whitelistedTokens[_token], "Token not whitelisted");
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.creator != address(0), "Invalid campaign");
        require(escrow.state == EscrowState.ACTIVE, "Not active");
        require(block.timestamp < escrow.deadline, "Campaign ended");
        require(_amount > 0, "Amount must be > 0");
        
        bool success = IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        require(success, "Transfer failed");
        
        erc20Deposits[_token][_campaign][msg.sender] += _amount;
        
        emit ERC20Deposited(_token, _campaign, msg.sender, _amount);
    }

    function requestReleaseFunds(address _campaign) external onlyCampaignOrOwner(_campaign) {
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.ACTIVE, "Not active");
        require(block.timestamp >= escrow.deadline, "Campaign not ended");
        
        escrow.state = EscrowState.PENDING_RELEASE;
        escrow.releaseRequestTime = block.timestamp;
        
        emit FundsReleaseRequested(_campaign);
    }

    function approveReleaseFunds(address _campaign) external {
        require(isApprover[msg.sender], "Not an approver");
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.PENDING_RELEASE, "Not pending");
        require(!hasApproved[msg.sender][_campaign], "Already approved");
        
        hasApproved[msg.sender][_campaign] = true;
        escrow.approvalCount++;
        
        emit FundsReleaseApproved(_campaign, msg.sender);
        
        if (escrow.approvalCount >= requiredApprovals && 
            block.timestamp >= escrow.releaseRequestTime + TIMELOCK_DURATION) {
            if (escrow.totalDeposited >= escrow.goal || escrow.isFlexibleFunding) {
                escrow.state = EscrowState.RELEASED;
            } else {
                escrow.state = EscrowState.REFUNDED;
            }
        }
    }

    function releaseFunds(address _campaign) external onlyOwner {
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.RELEASED, "Not ready for release");
        
        uint256 platformFee = (escrow.totalDeposited * platformFeePercentage) / 100;
        uint256 creatorAmount = escrow.totalDeposited - platformFee;
        
        // Transfer funds with proper fee distribution
        (bool success1, ) = payable(owner).call{value: platformFee}("");
        require(success1, "Platform fee transfer failed");
        (bool success2, ) = payable(escrow.creator).call{value: creatorAmount}("");
        require(success2, "Creator transfer failed");
        
        emit FundsReleased(_campaign, creatorAmount, platformFee);
        
        // Reset escrow state and clear approvals
        escrow.state = EscrowState.ACTIVE;
        escrow.totalDeposited = 0;
        escrow.releaseRequestTime = 0;
        escrow.approvalCount = 0;
        
        // Clear individual approver flags
        for (uint i = 0; i < approvers.length; i++) {
            hasApproved[approvers[i]][_campaign] = false;
        }
    }

    function claimRefund(address _campaign) external nonReentrant {
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.REFUNDED, "Not refunded");
        
        uint256 amount = ethDeposits[_campaign][msg.sender];
        require(amount > 0, "No ETH to refund");
        
        ethDeposits[_campaign][msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsRefunded(_campaign, msg.sender, amount);
    }

    function claimERC20Refund(address _token, address _campaign) external nonReentrant {
        require(whitelistedTokens[_token], "Token not whitelisted");
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.REFUNDED, "Not refunded");
        
        uint256 amount = erc20Deposits[_token][_campaign][msg.sender];
        require(amount > 0, "No tokens to refund");
        
        erc20Deposits[_token][_campaign][msg.sender] = 0;
        bool success = IERC20(_token).transfer(msg.sender, amount);
        require(success, "Transfer failed");
        
        emit ERC20Refunded(_token, _campaign, msg.sender, amount);
    }

    function getUserDeposit(address _campaign, address _user) public view returns (uint256) {
        return ethDeposits[_campaign][_user];
    }

    function getUserERC20Deposit(
        address _token,
        address _campaign,
        address _user
    ) public view returns (uint256) {
        return erc20Deposits[_token][_campaign][_user];
    }

    function getTotalDeposited(address _campaign) public view returns (uint256) {
        return escrows[_campaign].totalDeposited;
    }

    function getEscrowStatus(address _campaign) public view returns (EscrowState) {
        return escrows[_campaign].state;
    }

    function emergencyWithdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function emergencyWithdrawERC20(address _token) external onlyOwner nonReentrant {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(owner, balance);
    }
}
