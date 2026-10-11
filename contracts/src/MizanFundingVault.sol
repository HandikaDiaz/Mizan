// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title MizanFundingVault
/// @notice Escrow vault for target-capped campaign funding, milestone releases, and donor refunds.
contract MizanFundingVault is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant CAMPAIGN_MANAGER_ROLE = keccak256("CAMPAIGN_MANAGER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant DISBURSER_ROLE = keccak256("DISBURSER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Campaign {
        bytes32 externalRef;
        address recipient;
        uint256 targetAmount;
        uint256 fundedAmount;
        uint256 reservedAmount;
        uint256 releasedAmount;
        uint256 contributionCount;
        uint256 fundingDeadline;
        bool active;
        bool cancelled;
        bool exists;
    }

    struct Milestone {
        uint256 id;
        uint256 campaignId;
        uint256 amount;
        bytes32 evidenceHash;
        bool verified;
        bool released;
        bool exists;
    }

    struct MilestoneInput {
        uint256 id;
        uint256 amount;
    }

    mapping(uint256 => Campaign) private _campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) private _milestones;
    mapping(bytes32 => bool) public releaseKeyUsed;
    mapping(uint256 => mapping(address => uint256)) private _contributions;

    uint256 public fundingCount;

    event CampaignRegistered(
        uint256 indexed campaignId,
        bytes32 indexed externalRef,
        address indexed recipient,
        uint256 targetAmount,
        uint256 fundingDeadline,
        uint256 milestoneCount
    );
    event CampaignActiveChanged(uint256 indexed campaignId, bool active);
    event CampaignCancelled(uint256 indexed campaignId);
    event FundsCommitted(
        uint256 indexed campaignId,
        address indexed funder,
        uint256 amount,
        uint256 newFundedAmount
    );
    event RefundClaimed(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event MilestoneSubmitted(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        bytes32 evidenceHash
    );
    event MilestoneVerified(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        uint256 amount
    );
    event FundsReleased(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        address indexed recipient,
        uint256 amount,
        bytes32 releaseKey
    );

    error InvalidAdmin();
    error CampaignAlreadyExists(uint256 campaignId);
    error CampaignNotFound(uint256 campaignId);
    error CampaignNotActive(uint256 campaignId);
    error CampaignAlreadyCancelled(uint256 campaignId);
    error CampaignCannotBeCancelled(uint256 campaignId);
    error InvalidRecipient();
    error InvalidAmount();
    error InvalidExternalRef();
    error InvalidFundingDeadline();
    error FundingDeadlinePassed();
    error FundingTargetExceeded();
    error FundingTargetNotReached();
    error RefundNotAvailable();
    error NoContribution();
    error TransferFailed(address to, uint256 amount);
    error InvalidMilestone();
    error MilestoneAlreadyExists();
    error MilestoneNotFound(uint256 milestoneId);
    error MilestoneNotSubmitted();
    error MilestoneAlreadyVerified();
    error MilestoneAlreadyReleased();
    error MilestoneAmountMismatch();
    error InsufficientAvailableFunds();
    error ReleaseKeyAlreadyUsed();
    error InvalidReleaseKey();
    error InvalidEvidenceHash();
    error UnauthorizedBeneficiary();

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAdmin();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Registers an approved off-chain campaign with immutable milestone amounts.
    function registerCampaign(
        uint256 campaignId,
        bytes32 externalRef,
        address recipient,
        uint256 targetAmount,
        uint256 fundingDeadline,
        MilestoneInput[] calldata milestones
    ) external onlyRole(CAMPAIGN_MANAGER_ROLE) {
        if (_campaigns[campaignId].exists) revert CampaignAlreadyExists(campaignId);
        if (externalRef == bytes32(0)) revert InvalidExternalRef();
        if (recipient == address(0)) revert InvalidRecipient();
        if (targetAmount == 0) revert InvalidAmount();
        if (fundingDeadline <= block.timestamp) revert InvalidFundingDeadline();

        uint256 totalMilestoneAmount;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].id == 0 || milestones[i].amount == 0) revert InvalidMilestone();
            totalMilestoneAmount += milestones[i].amount;
        }
        if (totalMilestoneAmount != targetAmount) revert MilestoneAmountMismatch();

        _campaigns[campaignId] = Campaign({
            externalRef: externalRef,
            recipient: recipient,
            targetAmount: targetAmount,
            fundedAmount: 0,
            reservedAmount: 0,
            releasedAmount: 0,
            contributionCount: 0,
            fundingDeadline: fundingDeadline,
            active: true,
            cancelled: false,
            exists: true
        });

        for (uint256 i = 0; i < milestones.length; i++) {
            uint256 milestoneId = milestones[i].id;
            if (_milestones[campaignId][milestoneId].exists) revert MilestoneAlreadyExists();
            _milestones[campaignId][milestoneId] = Milestone({
                id: milestoneId,
                campaignId: campaignId,
                amount: milestones[i].amount,
                evidenceHash: bytes32(0),
                verified: false,
                released: false,
                exists: true
            });
        }

        emit CampaignRegistered(
            campaignId,
            externalRef,
            recipient,
            targetAmount,
            fundingDeadline,
            milestones.length
        );
    }

    function setCampaignActive(uint256 campaignId, bool active)
        external
        onlyRole(CAMPAIGN_MANAGER_ROLE)
    {
        Campaign storage campaign = _requireCampaign(campaignId);
        if (campaign.cancelled) revert CampaignAlreadyCancelled(campaignId);
        campaign.active = active;
        emit CampaignActiveChanged(campaignId, active);
    }

    function cancelCampaign(uint256 campaignId) external onlyRole(CAMPAIGN_MANAGER_ROLE) {
        Campaign storage campaign = _requireCampaign(campaignId);
        if (campaign.cancelled) revert CampaignAlreadyCancelled(campaignId);
        if (campaign.releasedAmount != 0) revert CampaignCannotBeCancelled(campaignId);
        campaign.active = false;
        campaign.cancelled = true;
        emit CampaignCancelled(campaignId);
    }

    /// @notice Holds native BNB in escrow and rejects funding above the immutable target.
    function fundCampaign(uint256 campaignId) external payable whenNotPaused nonReentrant {
        Campaign storage campaign = _requireActiveCampaign(campaignId);
        if (block.timestamp > campaign.fundingDeadline) revert FundingDeadlinePassed();
        if (msg.value == 0) revert InvalidAmount();
        if (campaign.fundedAmount + msg.value > campaign.targetAmount) revert FundingTargetExceeded();

        campaign.fundedAmount += msg.value;
        campaign.contributionCount += 1;
        _contributions[campaignId][msg.sender] += msg.value;
        fundingCount += 1;

        emit FundsCommitted(campaignId, msg.sender, msg.value, campaign.fundedAmount);
    }

    /// @notice Returns a donor's full contribution after a failed deadline or pre-release cancellation.
    function claimRefund(uint256 campaignId) external whenNotPaused nonReentrant {
        Campaign storage campaign = _requireCampaign(campaignId);
        bool deadlineFailed = block.timestamp > campaign.fundingDeadline
            && campaign.fundedAmount < campaign.targetAmount;
        if (!campaign.cancelled && !deadlineFailed) revert RefundNotAvailable();

        uint256 amount = _contributions[campaignId][msg.sender];
        if (amount == 0) revert NoContribution();

        _contributions[campaignId][msg.sender] = 0;
        campaign.fundedAmount -= amount;
        _payout(msg.sender, amount);

        emit RefundClaimed(campaignId, msg.sender, amount);
    }

    /// @notice Records a deterministic evidence hash from the recipient or campaign manager.
    function submitMilestone(
        uint256 campaignId,
        uint256 milestoneId,
        bytes32 evidenceHash
    ) external whenNotPaused {
        if (evidenceHash == bytes32(0)) revert InvalidEvidenceHash();

        Campaign storage campaign = _requireActiveCampaign(campaignId);
        Milestone storage milestone = _requireMilestone(campaignId, milestoneId);
        if (msg.sender != campaign.recipient && !hasRole(CAMPAIGN_MANAGER_ROLE, msg.sender)) {
            revert UnauthorizedBeneficiary();
        }
        if (milestone.verified) revert MilestoneAlreadyVerified();

        milestone.evidenceHash = evidenceHash;
        emit MilestoneSubmitted(campaignId, milestoneId, evidenceHash);
    }

    /// @notice Reserves the fixed milestone amount after authenticated approval.
    function verifyMilestone(uint256 campaignId, uint256 milestoneId)
        external
        whenNotPaused
        onlyRole(VERIFIER_ROLE)
    {
        Campaign storage campaign = _requireActiveCampaign(campaignId);
        Milestone storage milestone = _requireMilestone(campaignId, milestoneId);
        if (campaign.fundedAmount != campaign.targetAmount) revert FundingTargetNotReached();
        if (milestone.evidenceHash == bytes32(0)) revert MilestoneNotSubmitted();
        if (milestone.verified) revert MilestoneAlreadyVerified();

        uint256 available = _availableAmount(campaign);
        if (available < milestone.amount) revert InsufficientAvailableFunds();

        milestone.verified = true;
        campaign.reservedAmount += milestone.amount;

        emit MilestoneVerified(campaignId, milestoneId, milestone.amount);
    }

    /// @notice Releases the registered amount to the immutable recipient exactly once.
    function releaseFunds(uint256 campaignId, uint256 milestoneId, bytes32 releaseKey)
        external
        whenNotPaused
        onlyRole(DISBURSER_ROLE)
        nonReentrant
    {
        if (releaseKey == bytes32(0)) revert InvalidReleaseKey();
        if (releaseKeyUsed[releaseKey]) revert ReleaseKeyAlreadyUsed();

        Campaign storage campaign = _requireActiveCampaign(campaignId);
        Milestone storage milestone = _requireMilestone(campaignId, milestoneId);
        if (!milestone.verified) revert MilestoneNotSubmitted();
        if (milestone.released) revert MilestoneAlreadyReleased();
        if (campaign.reservedAmount < milestone.amount || address(this).balance < milestone.amount) {
            revert InsufficientAvailableFunds();
        }

        milestone.released = true;
        campaign.reservedAmount -= milestone.amount;
        campaign.releasedAmount += milestone.amount;
        releaseKeyUsed[releaseKey] = true;

        _payout(campaign.recipient, milestone.amount);

        emit FundsReleased(
            campaignId,
            milestoneId,
            campaign.recipient,
            milestone.amount,
            releaseKey
        );
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return _requireCampaignView(campaignId);
    }

    function getCampaignSummary(uint256 campaignId)
        external
        view
        returns (uint256 funded, uint256 reserved, uint256 released, uint256 available)
    {
        Campaign storage campaign = _requireCampaign(campaignId);
        return (
            campaign.fundedAmount,
            campaign.reservedAmount,
            campaign.releasedAmount,
            _availableAmount(campaign)
        );
    }

    function getMilestone(uint256 campaignId, uint256 milestoneId)
        external
        view
        returns (Milestone memory)
    {
        return _requireMilestoneView(campaignId, milestoneId);
    }

    function availableAmount(uint256 campaignId) external view returns (uint256) {
        return _availableAmount(_requireCampaign(campaignId));
    }

    function contributionOf(uint256 campaignId, address funder) external view returns (uint256) {
        return _contributions[campaignId][funder];
    }

    function getCampaignState(uint256 campaignId)
        external
        view
        returns (
            address recipient,
            uint256 targetAmount,
            uint256 fundedAmount,
            uint256 contributionCount,
            bool active
        )
    {
        Campaign storage campaign = _requireCampaign(campaignId);
        return (
            campaign.recipient,
            campaign.targetAmount,
            campaign.fundedAmount,
            campaign.contributionCount,
            campaign.active
        );
    }

    function _availableAmount(Campaign storage campaign) private view returns (uint256) {
        uint256 allocatedAmount = campaign.releasedAmount + campaign.reservedAmount;
        if (campaign.fundedAmount <= allocatedAmount) return 0;
        return campaign.fundedAmount - allocatedAmount;
    }

    function _requireCampaign(uint256 campaignId) private view returns (Campaign storage campaign) {
        campaign = _campaigns[campaignId];
        if (!campaign.exists) revert CampaignNotFound(campaignId);
    }

    function _requireCampaignView(uint256 campaignId)
        private
        view
        returns (Campaign memory campaign)
    {
        campaign = _campaigns[campaignId];
        if (!campaign.exists) revert CampaignNotFound(campaignId);
    }

    function _requireMilestone(uint256 campaignId, uint256 milestoneId)
        private
        view
        returns (Milestone storage milestone)
    {
        milestone = _milestones[campaignId][milestoneId];
        if (!milestone.exists) revert MilestoneNotFound(milestoneId);
    }

    function _requireMilestoneView(uint256 campaignId, uint256 milestoneId)
        private
        view
        returns (Milestone memory milestone)
    {
        milestone = _milestones[campaignId][milestoneId];
        if (!milestone.exists) revert MilestoneNotFound(milestoneId);
    }

    function _requireActiveCampaign(uint256 campaignId)
        private
        view
        returns (Campaign storage campaign)
    {
        campaign = _requireCampaign(campaignId);
        if (!campaign.active || campaign.cancelled) revert CampaignNotActive(campaignId);
    }

    function _payout(address to, uint256 amount) private {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed(to, amount);
    }
}
