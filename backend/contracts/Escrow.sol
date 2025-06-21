// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Escrow
 * @dev A secure escrow contract for handling transactions between parties
 * @author Your Name
 */
contract Escrow is ReentrancyGuard, Ownable, Pausable {
    
    enum EscrowState {
        CREATED,
        FUNDED,
        DELIVERED,
        COMPLETED,
        DISPUTED,
        CANCELLED,
        REFUNDED
    }
    
    struct EscrowTransaction {
        uint256 id;
        address payable buyer;
        address payable seller;
        address payable arbiter;
        uint256 amount;
        uint256 arbiterFee;
        EscrowState state;
        uint256 createdAt;
        uint256 deliveryDeadline;
        string description;
        bool buyerApproved;
        bool sellerApproved;
        bool arbiterDecision; // true for buyer, false for seller
        bool arbiterDecided;
    }
    
    // State variables
    mapping(uint256 => EscrowTransaction) public escrows;
    mapping(address => uint256[]) public userEscrows;
    uint256 public nextEscrowId;
    uint256 public platformFeePercent = 100; // 1% (100 basis points)
    address payable public platformFeeRecipient;
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        address arbiter,
        uint256 amount,
        string description
    );
    
    event EscrowFunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);
    event EscrowDelivered(uint256 indexed escrowId, address indexed seller);
    event EscrowCompleted(uint256 indexed escrowId, address indexed seller, uint256 amount);
    event EscrowDisputed(uint256 indexed escrowId, address indexed disputeInitiator);
    event EscrowResolved(uint256 indexed escrowId, address indexed winner, uint256 amount);
    event EscrowCancelled(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);
    
    // Modifiers
    modifier onlyBuyer(uint256 _escrowId) {
        require(escrows[_escrowId].buyer == msg.sender, "Only buyer can call this");
        _;
    }
    
    modifier onlySeller(uint256 _escrowId) {
        require(escrows[_escrowId].seller == msg.sender, "Only seller can call this");
        _;
    }
    
    modifier onlyArbiter(uint256 _escrowId) {
        require(escrows[_escrowId].arbiter == msg.sender, "Only arbiter can call this");
        _;
    }
    
    modifier onlyParties(uint256 _escrowId) {
        require(
            escrows[_escrowId].buyer == msg.sender ||
            escrows[_escrowId].seller == msg.sender ||
            escrows[_escrowId].arbiter == msg.sender,
            "Only parties can call this"
        );
        _;
    }
    
    modifier escrowExists(uint256 _escrowId) {
        require(_escrowId > 0 && _escrowId < nextEscrowId, "Escrow does not exist");
        _;
    }
    
    modifier inState(uint256 _escrowId, EscrowState _state) {
        require(escrows[_escrowId].state == _state, "Invalid escrow state");
        _;
    }
    
    constructor(address payable _platformFeeRecipient) Ownable(msg.sender) {
        platformFeeRecipient = _platformFeeRecipient;
        nextEscrowId = 1;
    }
    
    /**
     * @dev Create a new escrow transaction
     * @param _seller Address of the seller
     * @param _arbiter Address of the arbiter
     * @param _arbiterFee Fee for the arbiter in wei
     * @param _deliveryDeadline Deadline for delivery in seconds from now
     * @param _description Description of the transaction
     */
    function createEscrow(
        address payable _seller,
        address payable _arbiter,
        uint256 _arbiterFee,
        uint256 _deliveryDeadline,
        string calldata _description
    ) external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Escrow amount must be greater than 0");
        require(_seller != address(0), "Invalid seller address");
        require(_arbiter != address(0), "Invalid arbiter address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        require(_arbiter != msg.sender && _arbiter != _seller, "Invalid arbiter");
        require(_deliveryDeadline > block.timestamp, "Invalid delivery deadline");
        require(_arbiterFee <= msg.value / 2, "Arbiter fee too high");
        
        uint256 escrowId = nextEscrowId++;
        
        escrows[escrowId] = EscrowTransaction({
            id: escrowId,
            buyer: payable(msg.sender),
            seller: _seller,
            arbiter: _arbiter,
            amount: msg.value,
            arbiterFee: _arbiterFee,
            state: EscrowState.FUNDED,
            createdAt: block.timestamp,
            deliveryDeadline: _deliveryDeadline,
            description: _description,
            buyerApproved: false,
            sellerApproved: false,
            arbiterDecision: false,
            arbiterDecided: false
        });
        
        userEscrows[msg.sender].push(escrowId);
        userEscrows[_seller].push(escrowId);
        userEscrows[_arbiter].push(escrowId);
        
        emit EscrowCreated(escrowId, msg.sender, _seller, _arbiter, msg.value, _description);
        emit EscrowFunded(escrowId, msg.sender, msg.value);
    }
    
    /**
     * @dev Mark item as delivered by seller
     * @param _escrowId ID of the escrow
     */
    function markDelivered(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlySeller(_escrowId) 
        inState(_escrowId, EscrowState.FUNDED) 
        whenNotPaused 
    {
        require(block.timestamp <= escrows[_escrowId].deliveryDeadline, "Delivery deadline passed");
        
        escrows[_escrowId].state = EscrowState.DELIVERED;
        escrows[_escrowId].sellerApproved = true;
        
        emit EscrowDelivered(_escrowId, msg.sender);
    }
    
    /**
     * @dev Approve transaction completion by buyer
     * @param _escrowId ID of the escrow
     */
    function approveTransaction(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlyBuyer(_escrowId) 
        whenNotPaused 
    {
        require(
            escrows[_escrowId].state == EscrowState.DELIVERED || 
            escrows[_escrowId].state == EscrowState.FUNDED,
            "Invalid state for approval"
        );
        
        escrows[_escrowId].buyerApproved = true;
        
        // Complete transaction if item is delivered or if both parties approved
        if (escrows[_escrowId].state == EscrowState.DELIVERED || escrows[_escrowId].sellerApproved) {
            _completeTransaction(_escrowId);
        }
    }
    
    /**
     * @dev Complete the transaction and release funds
     * @param _escrowId ID of the escrow
     */
    function _completeTransaction(uint256 _escrowId) internal {
        EscrowTransaction storage escrow = escrows[_escrowId];
        escrow.state = EscrowState.COMPLETED;
        
        uint256 platformFee = (escrow.amount * platformFeePercent) / 10000;
        uint256 sellerAmount = escrow.amount - platformFee;
        
        // Transfer funds using call for better compatibility
        (bool success1, ) = escrow.seller.call{value: sellerAmount}("");
        require(success1, "Transfer to seller failed");
        
        (bool success2, ) = platformFeeRecipient.call{value: platformFee}("");
        require(success2, "Transfer to platform failed");
        
        emit EscrowCompleted(_escrowId, escrow.seller, sellerAmount);
    }
    
    /**
     * @dev Initiate dispute
     * @param _escrowId ID of the escrow
     */
    function initiateDispute(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlyParties(_escrowId) 
        whenNotPaused 
    {
        require(
            escrows[_escrowId].state == EscrowState.FUNDED || 
            escrows[_escrowId].state == EscrowState.DELIVERED,
            "Cannot dispute in current state"
        );
        
        escrows[_escrowId].state = EscrowState.DISPUTED;
        
        emit EscrowDisputed(_escrowId, msg.sender);
    }
    
    /**
     * @dev Resolve dispute by arbiter
     * @param _escrowId ID of the escrow
     * @param _buyerWins True if buyer wins, false if seller wins
     */
    function resolveDispute(uint256 _escrowId, bool _buyerWins) 
        external 
        escrowExists(_escrowId) 
        onlyArbiter(_escrowId) 
        inState(_escrowId, EscrowState.DISPUTED) 
        whenNotPaused 
    {
        EscrowTransaction storage escrow = escrows[_escrowId];
        escrow.arbiterDecision = _buyerWins;
        escrow.arbiterDecided = true;
        
        uint256 platformFee = (escrow.amount * platformFeePercent) / 10000;
        uint256 remainingAmount = escrow.amount - platformFee - escrow.arbiterFee;
        
        if (_buyerWins) {
            escrow.state = EscrowState.REFUNDED;
            (bool success1, ) = escrow.buyer.call{value: remainingAmount}("");
            require(success1, "Transfer to buyer failed");
            emit EscrowRefunded(_escrowId, escrow.buyer, remainingAmount);
        } else {
            escrow.state = EscrowState.COMPLETED;
            (bool success1, ) = escrow.seller.call{value: remainingAmount}("");
            require(success1, "Transfer to seller failed");
            emit EscrowCompleted(_escrowId, escrow.seller, remainingAmount);
        }
        
        // Pay arbiter and platform fees
        (bool success2, ) = escrow.arbiter.call{value: escrow.arbiterFee}("");
        require(success2, "Transfer to arbiter failed");
        
        (bool success3, ) = platformFeeRecipient.call{value: platformFee}("");
        require(success3, "Transfer to platform failed");
        
        emit EscrowResolved(_escrowId, _buyerWins ? escrow.buyer : escrow.seller, remainingAmount);
    }
    
    /**
     * @dev Cancel escrow before funding or after deadline
     * @param _escrowId ID of the escrow
     */
    function cancelEscrow(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        whenNotPaused 
    {
        EscrowTransaction storage escrow = escrows[_escrowId];
        
        require(
            msg.sender == escrow.buyer || 
            msg.sender == escrow.seller || 
            msg.sender == owner(),
            "Not authorized to cancel"
        );
        
        require(
            escrow.state == EscrowState.FUNDED && block.timestamp > escrow.deliveryDeadline,
            "Cannot cancel in current state"
        );
        
        escrow.state = EscrowState.CANCELLED;
        
        // Refund buyer minus platform fee
        uint256 platformFee = (escrow.amount * platformFeePercent) / 10000;
        uint256 refundAmount = escrow.amount - platformFee;
        
        (bool success1, ) = escrow.buyer.call{value: refundAmount}("");
        require(success1, "Transfer to buyer failed");
        
        (bool success2, ) = platformFeeRecipient.call{value: platformFee}("");
        require(success2, "Transfer to platform failed");
        
        emit EscrowCancelled(_escrowId);
        emit EscrowRefunded(_escrowId, escrow.buyer, refundAmount);
    }
    
    /**
     * @dev Emergency refund by owner
     * @param _escrowId ID of the escrow
     */
    function emergencyRefund(uint256 _escrowId) 
        external 
        onlyOwner 
        escrowExists(_escrowId) 
    {
        EscrowTransaction storage escrow = escrows[_escrowId];
        require(escrow.state == EscrowState.FUNDED || escrow.state == EscrowState.DELIVERED, "Invalid state");
        
        escrow.state = EscrowState.REFUNDED;
        (bool success, ) = escrow.buyer.call{value: escrow.amount}("");
        require(success, "Transfer to buyer failed");
        
        emit EscrowRefunded(_escrowId, escrow.buyer, escrow.amount);
    }
    
    // View functions
    function getEscrow(uint256 _escrowId) external view returns (EscrowTransaction memory) {
        return escrows[_escrowId];
    }
    
    function getUserEscrows(address _user) external view returns (uint256[] memory) {
        return userEscrows[_user];
    }
    
    function getEscrowCount() external view returns (uint256) {
        return nextEscrowId - 1;
    }
    
    // Admin functions
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    function setPlatformFeeRecipient(address payable _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        platformFeeRecipient = _recipient;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {
        revert("Direct payments not allowed");
    }
}