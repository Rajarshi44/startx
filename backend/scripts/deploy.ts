import { ethers } from "hardhat";
import { ContractFactory } from "ethers";

async function main(): Promise<void> {
  try {
    // Get the contract factory for DealFlowOracle
    const DealFlowOracle: ContractFactory = await ethers.getContractFactory("DealFlowOracle");

    console.log("Deploying DealFlowOracle...");
    // Deploy the contract
    const dealFlowOracle = await DealFlowOracle.deploy();

    // Get the deployment transaction
    const deploymentTx = dealFlowOracle.deploymentTransaction();
    if (!deploymentTx) {
      throw new Error("Deployment transaction is null");
    }

    // Wait for the transaction to be mined
    console.log("Waiting for deployment transaction to be mined...");
    const receipt = await deploymentTx.wait();

    if (receipt && receipt.contractAddress) {
      console.log("DealFlowOracle deployed to:", receipt.contractAddress);
      console.log("Transaction hash:", deploymentTx.hash);
    } else {
      throw new Error("Deploy failed - no contract address");
    }
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });