// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CrowdfundingCampaign.sol";

contract CrowdfundingFactory {
    address public owner;
    uint256 public platformFeePercentage;
    address[] public allCampaigns;
    mapping(address => address[]) public userCampaigns;

    event CampaignCreated(address indexed campaign, address indexed creator);
    event PlatformFeeChanged(uint256 newFee);

    constructor(uint256 _platformFeePercentage) {
        require(_platformFeePercentage <= 10, "Fee cannot exceed 10%");
        owner = msg.sender;
        platformFeePercentage = _platformFeePercentage;
    }

    function createCampaign(
        uint256 _goal,
        uint256 _deadline,
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        bool _isFlexible
    ) external returns (address) {
        require(_goal > 0, "Goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        CrowdfundingCampaign campaign = new CrowdfundingCampaign(
            msg.sender,
            _goal,
            _deadline,
            _name,
            _description,
            _imageUrl,
            _isFlexible,
            platformFeePercentage
        );

        allCampaigns.push(address(campaign));
        userCampaigns[msg.sender].push(address(campaign));

        emit CampaignCreated(address(campaign), msg.sender);
        return address(campaign);
    }

    function setPlatformFee(uint256 _newFee) external {
        require(msg.sender == owner, "Only owner can change fee");
        require(_newFee <= 10, "Fee cannot exceed 10%");
        platformFeePercentage = _newFee;
        emit PlatformFeeChanged(_newFee);
    }

    function getAllCampaigns() external view returns (address[] memory) {
        return allCampaigns;
    }

    function getUserCampaigns(address _user) external view returns (address[] memory) {
        return userCampaigns[_user];
    }
}
