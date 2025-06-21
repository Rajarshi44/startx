// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DealFlowOracle is Ownable, ReentrancyGuard {
    
    struct Company {
        string name;
        string description;
        string sector;
        string stage;
        uint256 valuation;
        bool isActive;
        uint256 timestamp;
    }
    
    struct Deal {
        uint256 companyId;
        string dealType;
        uint256 amount;
        string status;
        uint256 timestamp;
        bool isActive;
    }
    
    // Storage
    mapping(uint256 => Company) public companies;
    mapping(uint256 => Deal) public deals;
    mapping(address => bool) public authorizedOracles;
    
    uint256 public companyCount;
    uint256 public dealCount;
    uint256 public lastUpdateTimestamp;
    
    // Events
    event CompanyAdded(uint256 indexed companyId, string name, string sector);
    event CompanyUpdated(uint256 indexed companyId, string name);
    event DealAdded(uint256 indexed dealId, uint256 indexed companyId, uint256 amount);
    event DealUpdated(uint256 indexed dealId, string status);
    event OracleAuthorized(address indexed oracle);
    event OracleRevoked(address indexed oracle);
    event DataSyncCompleted(uint256 timestamp, uint256 companiesCount, uint256 dealsCount);
    
    modifier onlyOracle() {
        require(authorizedOracles[msg.sender] || msg.sender == owner(), "Not authorized oracle");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        authorizedOracles[msg.sender] = true;
    }
    
    // Oracle Management
    function authorizeOracle(address _oracle) external onlyOwner {
        authorizedOracles[_oracle] = true;
        emit OracleAuthorized(_oracle);
    }
    
    function revokeOracle(address _oracle) external onlyOwner {
        authorizedOracles[_oracle] = false;
        emit OracleRevoked(_oracle);
    }
    
    // Company Management
    function addCompany(
        string memory _name,
        string memory _description,
        string memory _sector,
        string memory _stage,
        uint256 _valuation
    ) external onlyOracle returns (uint256) {
        companyCount++;
        
        companies[companyCount] = Company({
            name: _name,
            description: _description,
            sector: _sector,
            stage: _stage,
            valuation: _valuation,
            isActive: true,
            timestamp: block.timestamp
        });
        
        emit CompanyAdded(companyCount, _name, _sector);
        return companyCount;
    }
    
    function updateCompany(
        uint256 _companyId,
        string memory _name,
        string memory _description,
        string memory _sector,
        string memory _stage,
        uint256 _valuation
    ) external onlyOracle {
        require(_companyId <= companyCount && _companyId > 0, "Invalid company ID");
        
        Company storage company = companies[_companyId];
        company.name = _name;
        company.description = _description;
        company.sector = _sector;
        company.stage = _stage;
        company.valuation = _valuation;
        company.timestamp = block.timestamp;
        
        emit CompanyUpdated(_companyId, _name);
    }
    
    // Deal Management
    function addDeal(
        uint256 _companyId,
        string memory _dealType,
        uint256 _amount,
        string memory _status
    ) external onlyOracle returns (uint256) {
        require(_companyId <= companyCount && _companyId > 0, "Invalid company ID");
        
        dealCount++;
        
        deals[dealCount] = Deal({
            companyId: _companyId,
            dealType: _dealType,
            amount: _amount,
            status: _status,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit DealAdded(dealCount, _companyId, _amount);
        return dealCount;
    }
    
    function updateDealStatus(uint256 _dealId, string memory _status) external onlyOracle {
        require(_dealId <= dealCount && _dealId > 0, "Invalid deal ID");
        
        deals[_dealId].status = _status;
        deals[_dealId].timestamp = block.timestamp;
        
        emit DealUpdated(_dealId, _status);
    }
    
    // Batch Operations for Efficient Oracle Updates
    function batchAddCompanies(
        string[] memory _names,
        string[] memory _descriptions,
        string[] memory _sectors,
        string[] memory _stages,
        uint256[] memory _valuations
    ) external onlyOracle {
        require(_names.length == _descriptions.length && 
                _names.length == _sectors.length && 
                _names.length == _stages.length && 
                _names.length == _valuations.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _names.length; i++) {
            companyCount++;
            companies[companyCount] = Company({
                name: _names[i],
                description: _descriptions[i],
                sector: _sectors[i],
                stage: _stages[i],
                valuation: _valuations[i],
                isActive: true,
                timestamp: block.timestamp
            });
            emit CompanyAdded(companyCount, _names[i], _sectors[i]);
        }
        
        lastUpdateTimestamp = block.timestamp;
        emit DataSyncCompleted(block.timestamp, companyCount, dealCount);
    }
    
    // Query Functions
    function getCompany(uint256 _companyId) external view returns (Company memory) {
        require(_companyId <= companyCount && _companyId > 0, "Invalid company ID");
        return companies[_companyId];
    }
    
    function getDeal(uint256 _dealId) external view returns (Deal memory) {
        require(_dealId <= dealCount && _dealId > 0, "Invalid deal ID");
        return deals[_dealId];
    }
    
    function getCompanyDeals(uint256 _companyId) external view returns (uint256[] memory) {
        require(_companyId <= companyCount && _companyId > 0, "Invalid company ID");
        
        // Count deals for this company
        uint256 count = 0;
        for (uint256 i = 1; i <= dealCount; i++) {
            if (deals[i].companyId == _companyId && deals[i].isActive) {
                count++;
            }
        }
        
        // Create array and populate
        uint256[] memory companyDeals = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= dealCount; i++) {
            if (deals[i].companyId == _companyId && deals[i].isActive) {
                companyDeals[index] = i;
                index++;
            }
        }
        
        return companyDeals;
    }
    
    function getCompaniesBySector(string memory _sector) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count companies in sector
        for (uint256 i = 1; i <= companyCount; i++) {
            if (companies[i].isActive && 
                keccak256(abi.encodePacked(companies[i].sector)) == keccak256(abi.encodePacked(_sector))) {
                count++;
            }
        }
        
        // Create array and populate
        uint256[] memory sectorCompanies = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= companyCount; i++) {
            if (companies[i].isActive && 
                keccak256(abi.encodePacked(companies[i].sector)) == keccak256(abi.encodePacked(_sector))) {
                sectorCompanies[index] = i;
                index++;
            }
        }
        
        return sectorCompanies;
    }
    
    function getTotalValuation() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= companyCount; i++) {
            if (companies[i].isActive) {
                total += companies[i].valuation;
            }
        }
        return total;
    }
    
    function getActiveDealsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= dealCount; i++) {
            if (deals[i].isActive && 
                keccak256(abi.encodePacked(deals[i].status)) != keccak256(abi.encodePacked("closed"))) {
                count++;
            }
        }
        return count;
    }
    
    // Emergency Functions
    function deactivateCompany(uint256 _companyId) external onlyOwner {
        require(_companyId <= companyCount && _companyId > 0, "Invalid company ID");
        companies[_companyId].isActive = false;
    }
    
    function deactivateDeal(uint256 _dealId) external onlyOwner {
        require(_dealId <= dealCount && _dealId > 0, "Invalid deal ID");
        deals[_dealId].isActive = false;
    }
}