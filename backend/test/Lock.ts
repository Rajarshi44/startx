import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("DealFlowOracle", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployDealFlowOracleFixture() {
    const [owner, oracle1, oracle2, otherAccount] = await hre.ethers.getSigners();

    const DealFlowOracle = await hre.ethers.getContractFactory("DealFlowOracle");
    const dealFlowOracle = await DealFlowOracle.deploy();

    return { dealFlowOracle, owner, oracle1, oracle2, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      expect(await dealFlowOracle.owner()).to.equal(owner.address);
    });

    it("Should authorize deployer as oracle", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      expect(await dealFlowOracle.authorizedOracles(owner.address)).to.be.true;
    });

    it("Should initialize counters to 0", async function () {
      const { dealFlowOracle } = await loadFixture(deployDealFlowOracleFixture);
      expect(await dealFlowOracle.companyCount()).to.equal(0);
      expect(await dealFlowOracle.dealCount()).to.equal(0);
    });
  });

  describe("Company Management", function () {
    it("Should add company by authorized oracle", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(
        dealFlowOracle.connect(owner).addCompany("TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10"))
      ).to.emit(dealFlowOracle, "CompanyAdded")
        .withArgs(1, "TechCorp", "Technology");

      expect(await dealFlowOracle.companyCount()).to.equal(1);
      
      const company = await dealFlowOracle.getCompany(1);
      expect(company.name).to.equal("TechCorp");
      expect(company.isActive).to.be.true;
    });

    it("Should fail to add company by unauthorized account", async function () {
      const { dealFlowOracle, otherAccount } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(
        dealFlowOracle.connect(otherAccount).addCompany("TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10"))
      ).to.be.revertedWith("Not authorized oracle");
    });
  });

  describe("Oracle Management", function () {
    it("Should authorize new oracle by owner", async function () {
      const { dealFlowOracle, owner, oracle1 } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(dealFlowOracle.connect(owner).authorizeOracle(oracle1.address))
        .to.emit(dealFlowOracle, "OracleAuthorized")
        .withArgs(oracle1.address);

      expect(await dealFlowOracle.authorizedOracles(oracle1.address)).to.be.true;
    });

    it("Should revoke oracle by owner", async function () {
      const { dealFlowOracle, owner, oracle1 } = await loadFixture(deployDealFlowOracleFixture);
      
      // First authorize
      await dealFlowOracle.connect(owner).authorizeOracle(oracle1.address);
      
      // Then revoke
      await expect(dealFlowOracle.connect(owner).revokeOracle(oracle1.address))
        .to.emit(dealFlowOracle, "OracleRevoked")
        .withArgs(oracle1.address);

      expect(await dealFlowOracle.authorizedOracles(oracle1.address)).to.be.false;
    });

    it("Should fail to authorize oracle by non-owner", async function () {
      const { dealFlowOracle, oracle1, oracle2 } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(dealFlowOracle.connect(oracle1).authorizeOracle(oracle2.address))
        .to.be.revertedWithCustomError(dealFlowOracle, "OwnableUnauthorizedAccount");
    });
  });

  describe("Company Management", function () {
    it("Should add company by authorized oracle", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      const name = "TechCorp";
      const description = "A innovative tech company";
      const sector = "Technology";
      const stage = "Series A";
      const valuation = hre.ethers.parseEther("10000000"); // 10M ETH

      await expect(
        dealFlowOracle.connect(owner).addCompany(name, description, sector, stage, valuation)
      ).to.emit(dealFlowOracle, "CompanyAdded")
        .withArgs(1, name, sector);

      expect(await dealFlowOracle.companyCount()).to.equal(1);

      const company = await dealFlowOracle.getCompany(1);
      expect(company.name).to.equal(name);
      expect(company.description).to.equal(description);
      expect(company.sector).to.equal(sector);
      expect(company.stage).to.equal(stage);
      expect(company.valuation).to.equal(valuation);
      expect(company.isActive).to.be.true;
    });

    it("Should update company by authorized oracle", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      // First add a company
      await dealFlowOracle.connect(owner).addCompany(
        "TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10000000")
      );

      const newName = "TechCorp Updated";
      const newDescription = "Updated tech company";
      const newSector = "FinTech";
      const newStage = "Series B";
      const newValuation = hre.ethers.parseEther("50000000");

      await expect(
        dealFlowOracle.connect(owner).updateCompany(1, newName, newDescription, newSector, newStage, newValuation)
      ).to.emit(dealFlowOracle, "CompanyUpdated")
        .withArgs(1, newName);

      const company = await dealFlowOracle.getCompany(1);
      expect(company.name).to.equal(newName);
      expect(company.description).to.equal(newDescription);
      expect(company.sector).to.equal(newSector);
      expect(company.stage).to.equal(newStage);
      expect(company.valuation).to.equal(newValuation);
    });

    it("Should fail to add company by unauthorized account", async function () {
      const { dealFlowOracle, otherAccount } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(
        dealFlowOracle.connect(otherAccount).addCompany(
          "TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10000000")
        )
      ).to.be.revertedWith("Not authorized oracle");
    });

    it("Should fail to update non-existent company", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(
        dealFlowOracle.connect(owner).updateCompany(
          999, "Invalid", "Invalid", "Invalid", "Invalid", 0
        )
      ).to.be.revertedWith("Invalid company ID");
    });
  });

  describe("Deal Management", function () {
    async function addCompanyFixture() {
      const fixture = await loadFixture(deployDealFlowOracleFixture);
      const { dealFlowOracle, owner } = fixture;
      
      await dealFlowOracle.connect(owner).addCompany(
        "TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10000000")
      );
      
      return fixture;
    }

    it("Should add deal for existing company", async function () {
      const { dealFlowOracle, owner } = await addCompanyFixture();
      
      const companyId = 1;
      const dealType = "Investment";
      const amount = hre.ethers.parseEther("5000000"); // 5M ETH
      const status = "Active";

      await expect(
        dealFlowOracle.connect(owner).addDeal(companyId, dealType, amount, status)
      ).to.emit(dealFlowOracle, "DealAdded")
        .withArgs(1, companyId, amount);

      expect(await dealFlowOracle.dealCount()).to.equal(1);

      const deal = await dealFlowOracle.getDeal(1);
      expect(deal.companyId).to.equal(companyId);
      expect(deal.dealType).to.equal(dealType);
      expect(deal.amount).to.equal(amount);
      expect(deal.status).to.equal(status);
      expect(deal.isActive).to.be.true;
    });

    it("Should update deal status", async function () {
      const { dealFlowOracle, owner } = await addCompanyFixture();
      
      // Add a deal first
      await dealFlowOracle.connect(owner).addDeal(1, "Investment", hre.ethers.parseEther("5000000"), "Active");

      const newStatus = "Completed";
      await expect(
        dealFlowOracle.connect(owner).updateDealStatus(1, newStatus)
      ).to.emit(dealFlowOracle, "DealUpdated")
        .withArgs(1, newStatus);

      const deal = await dealFlowOracle.getDeal(1);
      expect(deal.status).to.equal(newStatus);
    });

    it("Should fail to add deal for non-existent company", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(
        dealFlowOracle.connect(owner).addDeal(999, "Investment", hre.ethers.parseEther("5000000"), "Active")
      ).to.be.revertedWith("Invalid company ID");
    });

    it("Should fail to update non-existent deal", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(
        dealFlowOracle.connect(owner).updateDealStatus(999, "Completed")
      ).to.be.revertedWith("Invalid deal ID");
    });
  });

  describe("Batch Operations", function () {
    it("Should batch add companies", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      const names = ["Company1", "Company2", "Company3"];
      const descriptions = ["Desc1", "Desc2", "Desc3"];
      const sectors = ["Tech", "Finance", "Healthcare"];
      const stages = ["Seed", "Series A", "Series B"];
      const valuations = [
        hre.ethers.parseEther("1000000"),
        hre.ethers.parseEther("5000000"),
        hre.ethers.parseEther("10000000")
      ];

      await expect(
        dealFlowOracle.connect(owner).batchAddCompanies(names, descriptions, sectors, stages, valuations)
      ).to.emit(dealFlowOracle, "DataSyncCompleted")
        .withArgs(anyValue, 3, 0);

      expect(await dealFlowOracle.companyCount()).to.equal(3);

      // Check first company
      const company1 = await dealFlowOracle.getCompany(1);
      expect(company1.name).to.equal("Company1");
      expect(company1.sector).to.equal("Tech");

      // Check last company
      const company3 = await dealFlowOracle.getCompany(3);
      expect(company3.name).to.equal("Company3");
      expect(company3.sector).to.equal("Healthcare");
    });

    it("Should fail batch add with mismatched array lengths", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      const names = ["Company1", "Company2"];
      const descriptions = ["Desc1"]; // Mismatched length
      const sectors = ["Tech", "Finance"];
      const stages = ["Seed", "Series A"];
      const valuations = [hre.ethers.parseEther("1000000"), hre.ethers.parseEther("5000000")];

      await expect(
        dealFlowOracle.connect(owner).batchAddCompanies(names, descriptions, sectors, stages, valuations)
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("Query Functions", function () {
    async function setupCompaniesAndDeals() {
      const fixture = await loadFixture(deployDealFlowOracleFixture);
      const { dealFlowOracle, owner } = fixture;
      
      // Add companies
      await dealFlowOracle.connect(owner).addCompany(
        "TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10000000")
      );
      await dealFlowOracle.connect(owner).addCompany(
        "FinCorp", "Finance company", "Finance", "Series B", hre.ethers.parseEther("20000000")
      );
      await dealFlowOracle.connect(owner).addCompany(
        "TechStart", "Another tech company", "Technology", "Seed", hre.ethers.parseEther("1000000")
      );
      
      // Add deals
      await dealFlowOracle.connect(owner).addDeal(1, "Investment", hre.ethers.parseEther("5000000"), "Active");
      await dealFlowOracle.connect(owner).addDeal(1, "Acquisition", hre.ethers.parseEther("2000000"), "Pending");
      await dealFlowOracle.connect(owner).addDeal(2, "Investment", hre.ethers.parseEther("10000000"), "Active");
      await dealFlowOracle.connect(owner).addDeal(3, "Investment", hre.ethers.parseEther("500000"), "Closed");
      
      return fixture;
    }

    it("Should get company deals", async function () {
      const { dealFlowOracle } = await setupCompaniesAndDeals();
      
      const company1Deals = await dealFlowOracle.getCompanyDeals(1);
      expect(company1Deals.length).to.equal(2);
      expect(company1Deals[0]).to.equal(1);
      expect(company1Deals[1]).to.equal(2);

      const company2Deals = await dealFlowOracle.getCompanyDeals(2);
      expect(company2Deals.length).to.equal(1);
      expect(company2Deals[0]).to.equal(3);
    });

    it("Should get companies by sector", async function () {
      const { dealFlowOracle } = await setupCompaniesAndDeals();
      
      const techCompanies = await dealFlowOracle.getCompaniesBySector("Technology");
      expect(techCompanies.length).to.equal(2);
      expect(techCompanies[0]).to.equal(1);
      expect(techCompanies[1]).to.equal(3);

      const financeCompanies = await dealFlowOracle.getCompaniesBySector("Finance");
      expect(financeCompanies.length).to.equal(1);
      expect(financeCompanies[0]).to.equal(2);
    });

    it("Should get total valuation", async function () {
      const { dealFlowOracle } = await setupCompaniesAndDeals();
      
      const totalValuation = await dealFlowOracle.getTotalValuation();
      const expectedTotal = hre.ethers.parseEther("31000000"); // 10M + 20M + 1M
      expect(totalValuation).to.equal(expectedTotal);
    });

    it("Should get active deals count", async function () {
      const { dealFlowOracle } = await setupCompaniesAndDeals();
      
      const activeDealsCount = await dealFlowOracle.getActiveDealsCount();
      expect(activeDealsCount).to.equal(3); // All deals except "closed" status
    });

    it("Should fail to get invalid company", async function () {
      const { dealFlowOracle } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(dealFlowOracle.getCompany(999))
        .to.be.revertedWith("Invalid company ID");
    });

    it("Should fail to get invalid deal", async function () {
      const { dealFlowOracle } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(dealFlowOracle.getDeal(999))
        .to.be.revertedWith("Invalid deal ID");
    });
  });

  describe("Emergency Functions", function () {
    async function setupCompanyAndDeal() {
      const fixture = await loadFixture(deployDealFlowOracleFixture);
      const { dealFlowOracle, owner } = fixture;
      
      await dealFlowOracle.connect(owner).addCompany(
        "TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10000000")
      );
      await dealFlowOracle.connect(owner).addDeal(1, "Investment", hre.ethers.parseEther("5000000"), "Active");
      
      return fixture;
    }

    it("Should deactivate company by owner", async function () {
      const { dealFlowOracle, owner } = await setupCompanyAndDeal();
      
      await dealFlowOracle.connect(owner).deactivateCompany(1);
      
      const company = await dealFlowOracle.getCompany(1);
      expect(company.isActive).to.be.false;
    });

    it("Should deactivate deal by owner", async function () {
      const { dealFlowOracle, owner } = await setupCompanyAndDeal();
      
      await dealFlowOracle.connect(owner).deactivateDeal(1);
      
      const deal = await dealFlowOracle.getDeal(1);
      expect(deal.isActive).to.be.false;
    });

    it("Should fail to deactivate company by non-owner", async function () {
      const { dealFlowOracle, otherAccount } = await setupCompanyAndDeal();
      
      await expect(dealFlowOracle.connect(otherAccount).deactivateCompany(1))
        .to.be.revertedWithCustomError(dealFlowOracle, "OwnableUnauthorizedAccount");
    });

    it("Should fail to deactivate deal by non-owner", async function () {
      const { dealFlowOracle, otherAccount } = await setupCompanyAndDeal();
      
      await expect(dealFlowOracle.connect(otherAccount).deactivateDeal(1))
        .to.be.revertedWithCustomError(dealFlowOracle, "OwnableUnauthorizedAccount");
    });

    it("Should fail to deactivate invalid company", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(dealFlowOracle.connect(owner).deactivateCompany(999))
        .to.be.revertedWith("Invalid company ID");
    });

    it("Should fail to deactivate invalid deal", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(dealFlowOracle.connect(owner).deactivateDeal(999))
        .to.be.revertedWith("Invalid deal ID");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to perform oracle functions", async function () {
      const { dealFlowOracle, owner } = await loadFixture(deployDealFlowOracleFixture);
      
      // Owner should be able to add companies (as they are authorized as oracle)
      await expect(
        dealFlowOracle.connect(owner).addCompany(
          "TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10000000")
        )
      ).to.not.be.reverted;
    });

    it("Should allow authorized oracle to perform oracle functions", async function () {
      const { dealFlowOracle, owner, oracle1 } = await loadFixture(deployDealFlowOracleFixture);
      
      // Authorize oracle1
      await dealFlowOracle.connect(owner).authorizeOracle(oracle1.address);
      
      // Oracle1 should be able to add companies
      await expect(
        dealFlowOracle.connect(oracle1).addCompany(
          "TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10000000")
        )
      ).to.not.be.reverted;
    });

    it("Should prevent unauthorized accounts from oracle functions", async function () {
      const { dealFlowOracle, otherAccount } = await loadFixture(deployDealFlowOracleFixture);
      
      await expect(
        dealFlowOracle.connect(otherAccount).addCompany(
          "TechCorp", "Tech company", "Technology", "Series A", hre.ethers.parseEther("10000000")
        )
      ).to.be.revertedWith("Not authorized oracle");
    });
  });
});
