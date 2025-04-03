// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EscrowManager is ReentrancyGuard {
    // Escrow state
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
        mapping(address => uint256) tokenBalances; // Track ERC20 balances
    }
    
    // Platform owner address
    address public immutable owner;
    
    // Platform fee percentage (1 = 1%)
    uint256 public platformFeePercentage;
    
    // Multi-signature variables
    address[] public approvers;
    uint256 public requiredApprovals;
    mapping(address => bool) public isApprover;
    mapping(address => mapping(address => bool)) public hasApproved;
    
    // Time lock duration (2 days)
    uint256 public constant TIMELOCK_DURATION = 2 days;
    
    // Mapping of campaign to escrow details
    mapping(address => CampaignEscrow) public escrows;
    
    // Tracking ETH deposits per user
    mapping(address => mapping(address => uint256)) public ethDeposits; // campaign => user => amount
    
    // Tracking ERC20 deposits per user
    mapping(address => mapping(address => mapping(address => uint256))) public erc20Deposits; // token => campaign => user => amount
    
    // Events
    event FundsDeposited(address indexed campaign, address indexed depositor, uint256 amount);
    event ERC20Deposited(address indexed token, address indexed campaign, address indexed depositor, uint256 amount);
    event FundsReleaseRequested(address indexed campaign, uint256 requestTime);
    event FundsReleaseApproved(address indexed campaign, address indexed approver);
    event FundsReleased(address indexed campaign, uint256 creatorAmount, uint256 platformFee);
    event FundsRefunded(address indexed campaign, address indexed recipient, uint256 amount);
    event ERC20Refunded(address indexed token, address indexed campaign, address indexed recipient, uint256 amount);
    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);
    event TokenWhitelisted(address indexed token);
    event TokenRemovedFromWhitelist(address indexed token);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyCampaignOrOwner(address _campaign) {
        require(msg.sender == _campaign || msg.sender == owner, "Not authorized");
        _;
    }
    
    // ERC20 token whitelist
    mapping(address => bool) public whitelistedTokens;

    constructor(uint256 _platformFeePercentage, address[] memory _initialApprovers, uint256 _requiredApprovals) {
        owner = msg.sender;
        platformFeePercentage = _platformFeePercentage;
        for (uint i = 0; i < _initialApprovers.length; i++) {
            approvers.push(_initialApprovers[i]);
            isApprover[_initialApprovers[i]] = true;
        }
        requiredApprovals = _requiredApprovals;
    }

    /**
     * @notice Whitelist an ERC20 token
     * @param _token The token address to whitelist
     */
    function whitelistToken(address _token) external onlyOwner {
        require(!whitelistedTokens[_token], "Token already whitelisted");
        whitelistedTokens[_token] = true;
        emit TokenWhitelisted(_token);
    }

    /**
     * @notice Remove token from whitelist
     * @param _token The token address to remove
     */
    function removeTokenFromWhitelist(address _token) external onlyOwner {
        require(whitelistedTokens[_token], "Token not whitelisted");
        whitelistedTokens[_token] = false;
        emit TokenRemovedFromWhitelist(_token);
    }
    
    /**
     * @notice Initialize a new escrow for a campaign
     * @param _creator The campaign creator address
     * @param _campaign The campaign contract address
     * @param _goal The funding goal in wei
     * @param _deadline The UNIX timestamp when campaign ends
     * @param _isFlexibleFunding If true, creator keeps funds even if goal not met
     */
    function initializeEscrow(
        address _creator,
        address _campaign,
        uint256 _goal,
        uint256 _deadline,
        bool _isFlexibleFunding
    ) external onlyOwner {
        require(escrows[_campaign].creator == address(0), "Escrow already exists");
        
        CampaignEscrow storage escrow = escrows[_campaign];
        escrow.creator = _creator;
        escrow.campaign = _campaign;
        escrow.goal = _goal;
        escrow.deadline = _deadline;
        escrow.totalDeposited = 0;
        escrow.state = EscrowState.ACTIVE;
        escrow.isFlexibleFunding = _isFlexibleFunding;
        escrow.releaseRequestTime = 0;
        escrow.approvalCount = 0;
    }
    
    /**
     * @notice Deposit ETH into escrow
     * @param _campaign The campaign address
     */
    function deposit(address _campaign) external payable nonReentrant {
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.creator != address(0), "Invalid campaign");
        require(block.timestamp < escrow.deadline, "Campaign ended");
        require(msg.value > 0, "Must deposit ETH");
        
        // Record deposit
        ethDeposits[_campaign][msg.sender] += msg.value;
        escrow.totalDeposited += msg.value;
        
        emit FundsDeposited(_campaign, msg.sender, msg.value);
    }
    
    /**
     * @notice Deposit ERC20 tokens into escrow
     * @param _token The ERC20 token address
     * @param _campaign The campaign address
     * @param _amount The amount to deposit
     */
    function depositERC20(
        address _token,
        address _campaign, 
        uint256 _amount
    ) external nonReentrant {
        require(_token != address(0), "Invalid token");
        require(_campaign != address(0), "Invalid campaign");
        require(whitelistedTokens[_token], "Token not whitelisted");
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.creator != address(0), "Invalid campaign");
        require(block.timestamp < escrow.deadline, "Campaign ended");
        require(_amount > 0, "Amount must be > 0");
        
        // Transfer tokens from sender
        bool success = IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");
        
        // Record deposit
        erc20Deposits[_token][_campaign][msg.sender] += _amount;
        escrow.tokenBalances[_token] += _amount;
        
        emit ERC20Deposited(_token, _campaign, msg.sender, _amount);
    }
    
    /**
     * @notice Request release of funds to creator
     * @param _campaign The campaign address
     */
    function requestReleaseFunds(address _campaign) external onlyCampaignOrOwner(_campaign) {
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.ACTIVE, "Escrow not active");
        require(block.timestamp >= escrow.deadline, "Campaign not ended");
        
        escrow.releaseRequestTime = block.timestamp;
        escrow.state = EscrowState.PENDING_RELEASE;
        
        emit FundsReleaseRequested(_campaign, escrow.releaseRequestTime);
    }

    /**
     * @notice Approve release of funds
     * @param _campaign The campaign address
     */
    function approveReleaseFunds(address _campaign) external {
        require(isApprover[msg.sender], "Not an approver");
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.PENDING_RELEASE, "Release not requested");
        require(!hasApproved[msg.sender][_campaign], "Already approved");
        
        hasApproved[msg.sender][_campaign] = true;
        escrow.approvalCount++;
        
        emit FundsReleaseApproved(_campaign, msg.sender);
        
        if (escrow.approvalCount >= requiredApprovals && 
            block.timestamp >= escrow.releaseRequestTime + TIMELOCK_DURATION) {
            releaseFunds(_campaign);
        }
    }

    /**
     * @notice Release funds to creator based on campaign outcome
     * @param _campaign The campaign address
     */
    function releaseFunds(address _campaign) internal nonReentrant {
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.PENDING_RELEASE, "Release not approved");
        require(escrow.approvalCount >= requiredApprovals, "Not enough approvals");
        require(block.timestamp >= escrow.releaseRequestTime + TIMELOCK_DURATION, "Time lock not elapsed");
        
        // Check campaign success conditions
        bool isSuccess = escrow.isFlexibleFunding || escrow.totalDeposited >= escrow.goal;
        
        if (isSuccess) {
            // Calculate fees and amounts for ETH
            uint256 platformFee = (address(this).balance * platformFeePercentage) / 100;
            uint256 creatorAmount = address(this).balance - platformFee;
            
            // Transfer ETH funds
            payable(escrow.creator).transfer(creatorAmount);
            payable(owner).transfer(platformFee);
            
            // Transfer ERC20 tokens
            for (uint i = 0; i < approvers.length; i++) {
                address token = approvers[i];
                if (whitelistedTokens[token] && escrow.tokenBalances[token] > 0) {
                    uint256 tokenFee = (escrow.tokenBalances[token] * platformFeePercentage) / 100;
                    uint256 tokenCreatorAmount = escrow.tokenBalances[token] - tokenFee;
                    
                    IERC20(token).transfer(escrow.creator, tokenCreatorAmount);
                    IERC20(token).transfer(owner, tokenFee);
                    
                    escrow.tokenBalances[token] = 0;
                }
            }
            
            escrow.state = EscrowState.RELEASED;
            
            emit FundsReleased(_campaign, creatorAmount, platformFee);
        } else {
            escrow.state = EscrowState.REFUNDED;
        }
    }
    
    /**
     * @notice Claim refund for failed campaign (ETH)
     * @param _campaign The campaign address
     */
    function claimRefund(address _campaign) external nonReentrant {
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.REFUNDED, "No refund available");
        
        uint256 amount = ethDeposits[_campaign][msg.sender];
        require(amount > 0, "No ETH to refund");
        
        // Update state before transfer
        ethDeposits[_campaign][msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund transfer failed");
        
        emit FundsRefunded(_campaign, msg.sender, amount);
    }
    
    /**
     * @notice Claim refund for failed campaign (ERC20)
     * @param _token The ERC20 token address
     * @param _campaign The campaign address
     */
    function claimERC20Refund(address _token, address _campaign) external nonReentrant {
        require(_token != address(0), "Invalid token");
        require(_campaign != address(0), "Invalid campaign");
        require(whitelistedTokens[_token], "Token not whitelisted");
        CampaignEscrow storage escrow = escrows[_campaign];
        require(escrow.state == EscrowState.REFUNDED, "No refund available");
        
        uint256 amount = erc20Deposits[_token][_campaign][msg.sender];
        require(amount > 0, "No tokens to refund");
        
        // Update state before transfer
        erc20Deposits[_token][_campaign][msg.sender] = 0;
        escrow.tokenBalances[_token] -= amount;
        
        bool success = IERC20(_token).transfer(msg.sender, amount);
        require(success, "Token refund failed");
        
        emit ERC20Refunded(_token, _campaign, msg.sender, amount);
    }

    /**
     * @notice Get total deposited amount for a campaign (ETH + ERC20)
     * @param _campaign The campaign address
     * @return total The total deposited amount
     */
    function getTotalDeposited(address _campaign) public view returns (uint256 total) {
        CampaignEscrow storage escrow = escrows[_campaign];
        total = escrow.totalDeposited; // ETH deposits

        uint256 approversLength = approvers.length;
        for (uint256 i = 0; i < approversLength; i++) {
            address token = approvers[i];
            if (whitelistedTokens[token]) {
                uint256 tokenBalance = escrow.tokenBalances[token];
                if (tokenBalance > 0) {
                    total += tokenBalance;
                }
            }
        }
    }
    
    /**
     * @notice Update platform fee percentage (owner only)
     * @param _newFee The new fee percentage (1 = 1%)
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 10, "Fee cannot exceed 10%");
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = _newFee;
        emit PlatformFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @notice Emergency withdrawal of ETH (owner only)
     */
    function emergencyWithdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    /**
     * @notice Emergency withdrawal of ERC20 tokens (owner only)
     * @param _token The ERC20 token address
     */
    function emergencyWithdrawERC20(address _token) external onlyOwner nonReentrant {
        require(_token != address(0), "Invalid token");
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(owner, balance);
    }
    
    // Get campaign escrow status
    function getEscrowStatus(address _campaign) external view returns (EscrowState) {
        return escrows[_campaign].state;
    }
    
    // Get user's ETH deposit amount for a campaign
    function getUserDeposit(address _campaign, address _user) external view returns (uint256) {
        return ethDeposits[_campaign][_user];
    }
    
    // Get user's ERC20 deposit amount for a campaign
    function getUserERC20Deposit(
        address _token,
        address _campaign,
        address _user
    ) external view returns (uint256) {
        return erc20Deposits[_token][_campaign][_user];
    }
}
