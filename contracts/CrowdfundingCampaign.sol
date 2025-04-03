// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CrowdfundingCampaign is ReentrancyGuard {
    // Governance variables
    mapping(address => bool) public hasVoted;
    uint256 public votesForExtension;
    uint256 public votesForRelease;
    uint256 public constant VOTING_THRESHOLD = 51; // 51% majority
    uint256 public constant TIMELOCK_DURATION = 2 days;
    uint256 public withdrawalRequestTime;
    uint256 public extensionRequestTime;

    // Events
    event VoteCast(address indexed voter, bool forExtension, bool forRelease);
    event WithdrawalRequested(uint256 requestTime);
    event ExtensionRequested(uint256 requestTime, uint256 newDeadline);
    // Campaign state variables
    address public creator;
    uint256 public goal;
    uint256 public deadline;
    uint256 public totalRaised;
    uint256 public platformFeePercentage;
    bool public isFlexibleFunding;
    bool public isGoalMet;
    bool public fundsWithdrawn;
    
    // Campaign metadata
    string public title;
    string public description;
    string public imageURL;
    
    // Tracking contributions
    mapping(address => uint256) public contributions;
    address[] public contributors;
    
    // Tracking ERC20 contributions
    mapping(address => mapping(address => uint256)) public erc20Contributions;
    mapping(address => address[]) public erc20Contributors;
    mapping(address => uint256) public erc20TotalContributions;
    
    // Funding Tier structure
    struct Tier {
        uint256 minAmount;
        string rewardDescription;
        uint256 maxBackers;
        uint256 currentBackers;
    }
    
    // Tier tracking
    Tier[] public tiers;
    mapping(address => uint256) public backerTier; // contributor => tier index
    
    // Events
    event Contributed(address indexed contributor, uint256 amount, uint256 tierIndex);
    event RefundClaimed(address indexed contributor, uint256 amount);
    event FundsWithdrawn(uint256 amount, uint256 platformFee);
    event CampaignExtended(uint256 newDeadline);
    event TierCreated(uint256 indexed tierIndex, uint256 minAmount, string rewardDescription);
    event RewardClaimed(address indexed backer, uint256 tierIndex);
    
    // Modifiers
    modifier onlyCreator() {
        require(msg.sender == creator, "Only the creator can call this function");
        _;
    }
    
    modifier campaignActive() {
        require(block.timestamp < deadline, "Campaign has ended");
        _;
    }
    
    modifier campaignEnded() {
        require(block.timestamp >= deadline, "Campaign is still active");
        _;
    }
    
    constructor(
        address _creator,
        uint256 _goal,
        uint256 _deadline,
        uint256 _platformFeePercentage,
        bool _isFlexibleFunding,
        string memory _title,
        string memory _description,
        string memory _imageURL
    ) {
        creator = _creator;
        goal = _goal;
        deadline = _deadline;
        platformFeePercentage = _platformFeePercentage;
        isFlexibleFunding = _isFlexibleFunding;
        title = _title;
        description = _description;
        imageURL = _imageURL;
    }
    
    /**
     * @notice Contribute ETH to the campaign
     */
    function contribute(uint256 _tierIndex) external payable campaignActive {
        require(msg.value > 0, "Must send ETH");
        require(_tierIndex < tiers.length, "Invalid tier");
        Tier storage tier = tiers[_tierIndex];
        require(msg.value >= tier.minAmount, "Amount below tier minimum");
        require(tier.currentBackers < tier.maxBackers, "Tier is full");
        
        // Record contribution
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        backerTier[msg.sender] = _tierIndex;
        tier.currentBackers++;
        
        // Check if goal is met
        if (totalRaised >= goal) {
            isGoalMet = true;
        }
        
        emit Contributed(msg.sender, msg.value, _tierIndex);
    }
    
    /**
     * @notice Contribute ERC20 tokens to the campaign
     * @param _token The ERC20 token address
     * @param _amount The amount to contribute
     */
    function contributeERC20(address _token, uint256 _amount, uint256 _tierIndex) external campaignActive {
        require(_amount > 0, "Amount must be greater than zero");
        
        // Transfer tokens from contributor
        bool success = IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");
        
        // Record contribution
        if (erc20Contributions[_token][msg.sender] == 0) {
            erc20Contributors[_token].push(msg.sender);
        }
        erc20Contributions[_token][msg.sender] += _amount;
        erc20TotalContributions[_token] += _amount;
        
        require(_tierIndex < tiers.length, "Invalid tier");
        Tier storage tier = tiers[_tierIndex];
        require(_amount >= tier.minAmount, "Amount below tier minimum");
        require(tier.currentBackers < tier.maxBackers, "Tier is full");
        
        backerTier[msg.sender] = _tierIndex;
        tier.currentBackers++;
        emit Contributed(msg.sender, _amount, _tierIndex);
    }
    
    /**
     * @notice Withdraw funds if campaign is successful
     */
    function requestWithdrawal() external onlyCreator campaignEnded {
        require(isFlexibleFunding || isGoalMet, "Campaign not successful");
        require(votesForRelease * 100 / contributors.length >= VOTING_THRESHOLD, "Not enough votes for fund release");
        withdrawalRequestTime = block.timestamp;
        emit WithdrawalRequested(withdrawalRequestTime);
    }

    function withdrawFunds() external onlyCreator campaignEnded nonReentrant {
        require(!fundsWithdrawn, "Funds have already been withdrawn");
        require(withdrawalRequestTime > 0, "Withdrawal not requested");
        require(block.timestamp >= withdrawalRequestTime + TIMELOCK_DURATION, "Time lock period not elapsed");
        
        if (isFlexibleFunding || isGoalMet) {
            uint256 platformFee = (address(this).balance * platformFeePercentage) / 100;
            uint256 creatorAmount = address(this).balance - platformFee;
            
            // Transfer funds
            payable(creator).transfer(creatorAmount);
            fundsWithdrawn = true;
            
            emit FundsWithdrawn(creatorAmount, platformFee);
        } else {
            revert("Campaign failed and is not flexible funding");
        }
    }
    
    /**
     * @notice Claim refund if campaign failed
     */
    function claimRefund() external campaignEnded nonReentrant {
        require(!isGoalMet && !isFlexibleFunding, "Refund not available");
        require(contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund transfer failed");
        
        emit RefundClaimed(msg.sender, amount);
    }
    
    /**
     * @notice Claim ERC20 token refund if campaign failed
     * @param _token The ERC20 token address
     */
    function claimERC20Refund(address _token) external campaignEnded nonReentrant {
        require(!isGoalMet && !isFlexibleFunding, "Refund not available");
        require(erc20Contributions[_token][msg.sender] > 0, "No contribution to refund");
        
        uint256 amount = erc20Contributions[_token][msg.sender];
        erc20Contributions[_token][msg.sender] = 0;
        
        bool success = IERC20(_token).transfer(msg.sender, amount);
        require(success, "Token refund failed");
        
        emit RefundClaimed(msg.sender, amount);
    }
    
    /**
     * @notice Extend campaign deadline (only creator)
     * @param _newDeadline The new deadline timestamp
     */
    function requestExtension(uint256 _newDeadline) external onlyCreator campaignActive {
        require(_newDeadline > deadline, "New deadline must be later than current");
        require(votesForExtension * 100 / contributors.length >= VOTING_THRESHOLD, "Not enough votes for extension");
        extensionRequestTime = block.timestamp;
        emit ExtensionRequested(extensionRequestTime, _newDeadline);
    }

    function extendDeadline(uint256 _newDeadline) external onlyCreator campaignActive {
        require(extensionRequestTime > 0, "Extension not requested");
        require(block.timestamp >= extensionRequestTime + TIMELOCK_DURATION, "Time lock period not elapsed");
        deadline = _newDeadline;
        emit CampaignExtended(_newDeadline);
        // Reset votes and request time after extension
        votesForExtension = 0;
        extensionRequestTime = 0;
        for (uint i = 0; i < contributors.length; i++) {
            hasVoted[contributors[i]] = false;
        }
    }

    /**
     * @notice Vote for campaign extension and fund release
     * @param _voteForExtension True if voting for deadline extension
     * @param _voteForRelease True if voting for fund release
     */
    function vote(bool _voteForExtension, bool _voteForRelease) external {
        require(contributions[msg.sender] > 0, "Only contributors can vote");
        require(!hasVoted[msg.sender], "Already voted");

        if (_voteForExtension) votesForExtension++;
        if (_voteForRelease) votesForRelease++;

        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, _voteForExtension, _voteForRelease);
    }
    
    /**
     * @notice Get total number of contributors
     */
    function getContributorCount() external view returns (uint256) {
        return contributors.length;
    }
    
    /**
     * @notice Get campaign status
     */
    /**
     * @notice Create a new funding tier
     * @param _minAmount Minimum contribution amount for this tier
     * @param _rewardDescription Description of the reward
     * @param _maxBackers Maximum number of backers for this tier
     */
    function createTier(
        uint256 _minAmount,
        string memory _rewardDescription,
        uint256 _maxBackers
    ) external onlyCreator campaignActive {
        tiers.push(Tier({
            minAmount: _minAmount,
            rewardDescription: _rewardDescription,
            maxBackers: _maxBackers,
            currentBackers: 0
        }));
        emit TierCreated(tiers.length - 1, _minAmount, _rewardDescription);
    }

    /**
     * @notice Claim reward for a successful campaign
     */
    function claimReward() external {
        require(isGoalMet || isFlexibleFunding, "Campaign not successful");
        require(contributions[msg.sender] > 0, "No contribution made");
        uint256 tierIndex = backerTier[msg.sender];
        require(tierIndex != 0 || tiers.length > 0, "No tier assigned");
        
        emit RewardClaimed(msg.sender, tierIndex);
    }

    function getStatus() external view returns (string memory) {
        if (block.timestamp < deadline) return "Active";
        if (isGoalMet || isFlexibleFunding) return "Successful";
        return "Failed";
    }
    
    // Fallback function to receive ETH
    receive() external payable {
        require(msg.value > 0, "Must send ETH");
        require(tiers.length > 0, "No tiers available - use contribute() with tier index");
        
        // Default to first tier if tiers exist
        uint256 tierIndex = 0;
        Tier storage tier = tiers[tierIndex];
        require(msg.value >= tier.minAmount, "Amount below tier minimum");
        require(tier.currentBackers < tier.maxBackers, "Tier is full");

        // Record contribution
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        backerTier[msg.sender] = tierIndex;
        tier.currentBackers++;

        // Check if goal is met
        if (totalRaised >= goal) {
            isGoalMet = true;
        }

        emit Contributed(msg.sender, msg.value, tierIndex);
    }
}
