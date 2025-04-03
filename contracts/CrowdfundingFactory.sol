// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CrowdfundingCampaign.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrowdfundingFactory is Ownable {
    // Platform fee percentage (1 = 1%)
    uint256 public platformFeePercentage;
    
    // Array of all created campaigns
    address[] public allCampaigns;
    
    // Mapping to track campaign creators
    mapping(address => address[]) public userCampaigns;
    
    // Platform statistics
    struct PlatformStats {
        uint256 totalCampaigns;
        uint256 totalRaised;
        uint256 totalSuccessful;
        uint256 totalContributors;
    }
    PlatformStats public stats;
    
    // Events
    event CampaignCreated(
        address indexed creator,
        address campaignAddress,
        uint256 goal,
        uint256 deadline,
        string title
    );
    event PlatformFeeChanged(uint256 newFee);
    
    constructor(uint256 _platformFeePercentage) Ownable(msg.sender) {
        require(_platformFeePercentage <= 10, "Fee cannot exceed 10%");
        platformFeePercentage = _platformFeePercentage;
    }
    
    /**
     * @notice Creates a new crowdfunding campaign
     * @param _goal The funding goal in wei
     * @param _deadline The UNIX timestamp when campaign ends
     * @param _title The title of the campaign
     * @param _description The description of the campaign
     * @param _imageURL URL for campaign image
     * @param _isFlexibleFunding If true, creator keeps funds even if goal not met
     */
    function createCampaign(
        uint256 _goal,
        uint256 _deadline,
        string memory _title,
        string memory _description,
        string memory _imageURL,
        bool _isFlexibleFunding
    ) external returns (address campaignAddress) {
        require(_goal > 0, "Goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        // Create new campaign
        CrowdfundingCampaign campaign = new CrowdfundingCampaign(
            msg.sender,
            _goal,
            _deadline,
            platformFeePercentage,
            _isFlexibleFunding,
            _title,
            _description,
            _imageURL
        );
        
        campaignAddress = address(campaign);
        
        // Update tracking
        allCampaigns.push(campaignAddress);
        userCampaigns[msg.sender].push(campaignAddress);
        
        // Update stats
        stats.totalCampaigns++;
        
        emit CampaignCreated(msg.sender, campaignAddress, _goal, _deadline, _title);
        
        return campaignAddress;
    }
    
    /**
     * @notice Changes the platform fee percentage
     * @param _newFee The new fee percentage (1 = 1%)
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 10, "Fee cannot exceed 10%");
        platformFeePercentage = _newFee;
        emit PlatformFeeChanged(_newFee);
    }
    
    /**
     * @notice Updates platform statistics when a campaign succeeds
     * @param _amountRaised The amount raised in the campaign
     * @param _contributorCount Number of unique contributors
     */
    function recordSuccessfulCampaign(uint256 _amountRaised, uint256 _contributorCount) external {
        require(isCampaign(msg.sender), "Caller not a campaign");
        
        stats.totalRaised += _amountRaised;
        stats.totalSuccessful++;
        stats.totalContributors += _contributorCount;
    }
    
    /**
     * @notice Checks if the caller is a deployed campaign
     */
    function isCampaign(address _campaignAddress) internal view returns (bool) {
        for (uint i = 0; i < allCampaigns.length; i++) {
            if (allCampaigns[i] == _campaignAddress) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Gets all campaigns created by a user
     */
    function getUserCampaigns(address _user) external view returns (address[] memory) {
        return userCampaigns[_user];
    }
    
    /**
     * @notice Gets total number of campaigns
     */
    function getTotalCampaigns() external view returns (uint256) {
        return allCampaigns.length;
    }
    
    /**
     * @notice Withdraws collected platform fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
}