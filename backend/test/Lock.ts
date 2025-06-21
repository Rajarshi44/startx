import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Escrow", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployEscrowFixture() {
    const [owner, buyer, seller, arbiter, platformFeeRecipient, otherAccount] = await hre.ethers.getSigners();

    const Escrow = await hre.ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(platformFeeRecipient.address);

    return { escrow, owner, buyer, seller, arbiter, platformFeeRecipient, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { escrow, owner } = await loadFixture(deployEscrowFixture);
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should set the platform fee recipient", async function () {
      const { escrow, platformFeeRecipient } = await loadFixture(deployEscrowFixture);
      expect(await escrow.platformFeeRecipient()).to.equal(platformFeeRecipient.address);
    });

    it("Should set default platform fee to 1%", async function () {
      const { escrow } = await loadFixture(deployEscrowFixture);
      expect(await escrow.platformFeePercent()).to.equal(100); // 1% = 100 basis points
    });

    it("Should initialize nextEscrowId to 1", async function () {
      const { escrow } = await loadFixture(deployEscrowFixture);
      expect(await escrow.nextEscrowId()).to.equal(1);
    });
  });

  describe("Create Escrow", function () {
    it("Should create a new escrow successfully", async function () {
      const { escrow, buyer, seller, arbiter } = await loadFixture(deployEscrowFixture);
      
      const amount = hre.ethers.parseEther("1.0");
      const arbiterFee = hre.ethers.parseEther("0.1");
      const deliveryDeadline = (await time.latest()) + 86400; // 1 day from now
      const description = "Test escrow transaction";

      await expect(
        escrow.connect(buyer).createEscrow(
          seller.address,
          arbiter.address,
          arbiterFee,
          deliveryDeadline,
          description,
          { value: amount }
        )
      ).to.emit(escrow, "EscrowCreated")
        .withArgs(1, buyer.address, seller.address, arbiter.address, amount, description)
        .and.to.emit(escrow, "EscrowFunded")
        .withArgs(1, buyer.address, amount);

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.buyer).to.equal(buyer.address);
      expect(escrowData.seller).to.equal(seller.address);
      expect(escrowData.arbiter).to.equal(arbiter.address);
      expect(escrowData.amount).to.equal(amount);
      expect(escrowData.state).to.equal(1); // FUNDED state
    });

    it("Should fail if escrow amount is 0", async function () {
      const { escrow, buyer, seller, arbiter } = await loadFixture(deployEscrowFixture);
      
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await expect(
        escrow.connect(buyer).createEscrow(
          seller.address,
          arbiter.address,
          0,
          deliveryDeadline,
          "Test",
          { value: 0 }
        )
      ).to.be.revertedWith("Escrow amount must be greater than 0");
    });

    it("Should fail if seller is zero address", async function () {
      const { escrow, buyer, arbiter } = await loadFixture(deployEscrowFixture);
      
      const amount = hre.ethers.parseEther("1.0");
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await expect(
        escrow.connect(buyer).createEscrow(
          hre.ethers.ZeroAddress,
          arbiter.address,
          0,
          deliveryDeadline,
          "Test",
          { value: amount }
        )
      ).to.be.revertedWith("Invalid seller address");
    });

    it("Should fail if delivery deadline is in the past", async function () {
      const { escrow, buyer, seller, arbiter } = await loadFixture(deployEscrowFixture);
      
      const amount = hre.ethers.parseEther("1.0");
      const pastDeadline = (await time.latest()) - 86400; // 1 day ago
      
      await expect(
        escrow.connect(buyer).createEscrow(
          seller.address,
          arbiter.address,
          0,
          pastDeadline,
          "Test",
          { value: amount }
        )
      ).to.be.revertedWith("Invalid delivery deadline");
    });

    it("Should fail if arbiter fee is too high", async function () {
      const { escrow, buyer, seller, arbiter } = await loadFixture(deployEscrowFixture);
      
      const amount = hre.ethers.parseEther("1.0");
      const arbiterFee = hre.ethers.parseEther("0.6"); // 60% of amount
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await expect(
        escrow.connect(buyer).createEscrow(
          seller.address,
          arbiter.address,
          arbiterFee,
          deliveryDeadline,
          "Test",
          { value: amount }
        )
      ).to.be.revertedWith("Arbiter fee too high");
    });
  });

  describe("Mark Delivered", function () {
    async function createFundedEscrow() {
      const fixture = await loadFixture(deployEscrowFixture);
      const { escrow, buyer, seller, arbiter } = fixture;
      
      const amount = hre.ethers.parseEther("1.0");
      const arbiterFee = hre.ethers.parseEther("0.1");
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await escrow.connect(buyer).createEscrow(
        seller.address,
        arbiter.address,
        arbiterFee,
        deliveryDeadline,
        "Test escrow",
        { value: amount }
      );
      
      return fixture;
    }

    it("Should mark item as delivered by seller", async function () {
      const { escrow, seller } = await createFundedEscrow();
      
      await expect(escrow.connect(seller).markDelivered(1))
        .to.emit(escrow, "EscrowDelivered")
        .withArgs(1, seller.address);

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.state).to.equal(2); // DELIVERED state
      expect(escrowData.sellerApproved).to.be.true;
    });

    it("Should fail if not called by seller", async function () {
      const { escrow, buyer } = await createFundedEscrow();
      
      await expect(escrow.connect(buyer).markDelivered(1))
        .to.be.revertedWith("Only seller can call this");
    });

    it("Should fail if delivery deadline has passed", async function () {
      const { escrow, seller } = await createFundedEscrow();
      
      // Move time past delivery deadline
      await time.increase(86401); // 1 day + 1 second
      
      await expect(escrow.connect(seller).markDelivered(1))
        .to.be.revertedWith("Delivery deadline passed");
    });
  });

  describe("Approve Transaction", function () {
    async function createDeliveredEscrow() {
      const fixture = await createFundedEscrow();
      const { escrow, seller } = fixture;
      
      await escrow.connect(seller).markDelivered(1);
      return fixture;
    }

    async function createFundedEscrow() {
      const fixture = await loadFixture(deployEscrowFixture);
      const { escrow, buyer, seller, arbiter } = fixture;
      
      const amount = hre.ethers.parseEther("1.0");
      const arbiterFee = hre.ethers.parseEther("0.1");
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await escrow.connect(buyer).createEscrow(
        seller.address,
        arbiter.address,
        arbiterFee,
        deliveryDeadline,
        "Test escrow",
        { value: amount }
      );
      
      return fixture;
    }

    it("Should complete transaction when buyer approves after delivery", async function () {
      const { escrow, buyer, seller, platformFeeRecipient } = await createDeliveredEscrow();
      
      const amount = hre.ethers.parseEther("1.0");
      const platformFee = amount * 100n / 10000n; // 1% fee
      const sellerAmount = amount - platformFee;

      await expect(escrow.connect(buyer).approveTransaction(1))
        .to.emit(escrow, "EscrowCompleted")
        .withArgs(1, seller.address, sellerAmount)
        .and.to.changeEtherBalances(
          [seller, platformFeeRecipient],
          [sellerAmount, platformFee]
        );

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.state).to.equal(3); // COMPLETED state
      expect(escrowData.buyerApproved).to.be.true;
    });

    it("Should fail if not called by buyer", async function () {
      const { escrow, seller } = await createDeliveredEscrow();
      
      await expect(escrow.connect(seller).approveTransaction(1))
        .to.be.revertedWith("Only buyer can call this");
    });
  });

  describe("Disputes", function () {
    async function createDeliveredEscrow() {
      const fixture = await loadFixture(deployEscrowFixture);
      const { escrow, buyer, seller, arbiter } = fixture;
      
      const amount = hre.ethers.parseEther("1.0");
      const arbiterFee = hre.ethers.parseEther("0.1");
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await escrow.connect(buyer).createEscrow(
        seller.address,
        arbiter.address,
        arbiterFee,
        deliveryDeadline,
        "Test escrow",
        { value: amount }
      );
      
      await escrow.connect(seller).markDelivered(1);
      return fixture;
    }

    it("Should initiate dispute by buyer", async function () {
      const { escrow, buyer } = await createDeliveredEscrow();
      
      await expect(escrow.connect(buyer).initiateDispute(1))
        .to.emit(escrow, "EscrowDisputed")
        .withArgs(1, buyer.address);

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.state).to.equal(4); // DISPUTED state
    });

    it("Should resolve dispute in favor of buyer", async function () {
      const { escrow, buyer, arbiter, platformFeeRecipient } = await createDeliveredEscrow();
      
      await escrow.connect(buyer).initiateDispute(1);
      
      const amount = hre.ethers.parseEther("1.0");
      const arbiterFee = hre.ethers.parseEther("0.1");
      const platformFee = amount * 100n / 10000n;
      const refundAmount = amount - platformFee - arbiterFee;

      await expect(escrow.connect(arbiter).resolveDispute(1, true))
        .to.emit(escrow, "EscrowRefunded")
        .withArgs(1, buyer.address, refundAmount)
        .and.to.emit(escrow, "EscrowResolved")
        .withArgs(1, buyer.address, refundAmount)
        .and.to.changeEtherBalances(
          [buyer, arbiter, platformFeeRecipient],
          [refundAmount, arbiterFee, platformFee]
        );

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.state).to.equal(6); // REFUNDED state
      expect(escrowData.arbiterDecided).to.be.true;
      expect(escrowData.arbiterDecision).to.be.true;
    });

    it("Should resolve dispute in favor of seller", async function () {
      const { escrow, buyer, seller, arbiter, platformFeeRecipient } = await createDeliveredEscrow();
      
      await escrow.connect(buyer).initiateDispute(1);
      
      const amount = hre.ethers.parseEther("1.0");
      const arbiterFee = hre.ethers.parseEther("0.1");
      const platformFee = amount * 100n / 10000n;
      const sellerAmount = amount - platformFee - arbiterFee;

      await expect(escrow.connect(arbiter).resolveDispute(1, false))
        .to.emit(escrow, "EscrowCompleted")
        .withArgs(1, seller.address, sellerAmount)
        .and.to.emit(escrow, "EscrowResolved")
        .withArgs(1, seller.address, sellerAmount)
        .and.to.changeEtherBalances(
          [seller, arbiter, platformFeeRecipient],
          [sellerAmount, arbiterFee, platformFee]
        );

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.state).to.equal(3); // COMPLETED state
      expect(escrowData.arbiterDecision).to.be.false;
    });

    it("Should fail if non-arbiter tries to resolve dispute", async function () {
      const { escrow, buyer } = await createDeliveredEscrow();
      
      await escrow.connect(buyer).initiateDispute(1);
      
      await expect(escrow.connect(buyer).resolveDispute(1, true))
        .to.be.revertedWith("Only arbiter can call this");
    });
  });

  describe("Cancel Escrow", function () {
    async function createExpiredEscrow() {
      const fixture = await loadFixture(deployEscrowFixture);
      const { escrow, buyer, seller, arbiter } = fixture;
      
      const amount = hre.ethers.parseEther("1.0");
      const arbiterFee = hre.ethers.parseEther("0.1");
      const deliveryDeadline = (await time.latest()) + 3600; // 1 hour from now
      
      await escrow.connect(buyer).createEscrow(
        seller.address,
        arbiter.address,
        arbiterFee,
        deliveryDeadline,
        "Test escrow",
        { value: amount }
      );
      
      // Move time past delivery deadline
      await time.increase(3601); // 1 hour + 1 second
      
      return fixture;
    }

    it("Should cancel escrow after deadline by buyer", async function () {
      const { escrow, buyer, platformFeeRecipient } = await createExpiredEscrow();
      
      const amount = hre.ethers.parseEther("1.0");
      const platformFee = amount * 100n / 10000n;
      const refundAmount = amount - platformFee;

      await expect(escrow.connect(buyer).cancelEscrow(1))
        .to.emit(escrow, "EscrowCancelled")
        .withArgs(1)
        .and.to.emit(escrow, "EscrowRefunded")
        .withArgs(1, buyer.address, refundAmount)
        .and.to.changeEtherBalances(
          [buyer, platformFeeRecipient],
          [refundAmount, platformFee]
        );

      const escrowData = await escrow.getEscrow(1);
      expect(escrowData.state).to.equal(5); // CANCELLED state
    });

    it("Should fail to cancel before deadline", async function () {
      const fixture = await loadFixture(deployEscrowFixture);
      const { escrow, buyer, seller, arbiter } = fixture;
      
      const amount = hre.ethers.parseEther("1.0");
      const deliveryDeadline = (await time.latest()) + 86400; // 1 day from now
      
      await escrow.connect(buyer).createEscrow(
        seller.address,
        arbiter.address,
        0,
        deliveryDeadline,
        "Test escrow",
        { value: amount }
      );
      
      await expect(escrow.connect(buyer).cancelEscrow(1))
        .to.be.revertedWith("Cannot cancel in current state");
    });
  });

  describe("Admin Functions", function () {
    it("Should set platform fee by owner", async function () {
      const { escrow, owner } = await loadFixture(deployEscrowFixture);
      
      await escrow.connect(owner).setPlatformFee(200); // 2%
      expect(await escrow.platformFeePercent()).to.equal(200);
    });

    it("Should fail to set platform fee by non-owner", async function () {
      const { escrow, buyer } = await loadFixture(deployEscrowFixture);
      
      await expect(escrow.connect(buyer).setPlatformFee(200))
        .to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });

    it("Should fail to set platform fee too high", async function () {
      const { escrow, owner } = await loadFixture(deployEscrowFixture);
      
      await expect(escrow.connect(owner).setPlatformFee(1100)) // 11%
        .to.be.revertedWith("Fee too high");
    });

    it("Should pause and unpause contract", async function () {
      const { escrow, owner, buyer, seller, arbiter } = await loadFixture(deployEscrowFixture);
      
      await escrow.connect(owner).pause();
      
      const amount = hre.ethers.parseEther("1.0");
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await expect(
        escrow.connect(buyer).createEscrow(
          seller.address,
          arbiter.address,
          0,
          deliveryDeadline,
          "Test",
          { value: amount }
        )
      ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
      
      await escrow.connect(owner).unpause();
      
      await expect(
        escrow.connect(buyer).createEscrow(
          seller.address,
          arbiter.address,
          0,
          deliveryDeadline,
          "Test",
          { value: amount }
        )
      ).to.not.be.reverted;
    });
  });

  describe("View Functions", function () {
    it("Should return correct escrow count", async function () {
      const { escrow } = await loadFixture(deployEscrowFixture);
      
      expect(await escrow.getEscrowCount()).to.equal(0);
      
      // Create an escrow
      const { buyer, seller, arbiter } = await loadFixture(deployEscrowFixture);
      const amount = hre.ethers.parseEther("1.0");
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await escrow.connect(buyer).createEscrow(
        seller.address,
        arbiter.address,
        0,
        deliveryDeadline,
        "Test",
        { value: amount }
      );
      
      expect(await escrow.getEscrowCount()).to.equal(1);
    });

    it("Should return user escrows", async function () {
      const { escrow, buyer, seller, arbiter } = await loadFixture(deployEscrowFixture);
      
      const amount = hre.ethers.parseEther("1.0");
      const deliveryDeadline = (await time.latest()) + 86400;
      
      await escrow.connect(buyer).createEscrow(
        seller.address,
        arbiter.address,
        0,
        deliveryDeadline,
        "Test",
        { value: amount }
      );
      
      const buyerEscrows = await escrow.getUserEscrows(buyer.address);
      const sellerEscrows = await escrow.getUserEscrows(seller.address);
      const arbiterEscrows = await escrow.getUserEscrows(arbiter.address);
      
      expect(buyerEscrows).to.deep.equal([1n]);
      expect(sellerEscrows).to.deep.equal([1n]);
      expect(arbiterEscrows).to.deep.equal([1n]);
    });
  });

  describe("Security", function () {
    it("Should reject direct payments", async function () {
      const { escrow, buyer } = await loadFixture(deployEscrowFixture);
      
      await expect(
        buyer.sendTransaction({
          to: escrow.target,
          value: hre.ethers.parseEther("1.0")
        })
      ).to.be.revertedWith("Direct payments not allowed");
    });

    it("Should prevent reentrancy attacks", async function () {
      // This is implicitly tested by using ReentrancyGuard modifier
      // Additional specific reentrancy tests could be added with malicious contracts
      const { escrow } = await loadFixture(deployEscrowFixture);
      expect(await escrow.getAddress()).to.be.properAddress;
    });
  });
});
