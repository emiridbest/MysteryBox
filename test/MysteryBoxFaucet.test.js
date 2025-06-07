const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MysteryBoxFaucet", function () {
  let mysteryBoxFaucet;
  let mockToken;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    // Deploy a mock ERC20 token for testing
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock celoUSD", "mcUSD");
    
    // Deploy the MysteryBoxFaucet contract
    const MysteryBoxFaucet = await ethers.getContractFactory("MysteryBoxFaucet");
    mysteryBoxFaucet = await MysteryBoxFaucet.deploy(mockToken.address);
    
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Mint tokens to owner and fund the faucet
    await mockToken.mint(owner.address, ethers.parseEther("1000"));
    await mockToken.approve(mysteryBoxFaucet.address, ethers.parseEther("500"));
    await mysteryBoxFaucet.fundFaucet(ethers.parseEther("500"));
  });

  it("should return the correct faucet balance", async function () {
    expect(await mysteryBoxFaucet.getFaucetBalance()).to.equal(ethers.parseEther("500"));
  });

  it("should allow users to claim rewards within limits", async function () {
    // Calculate valid claim amount (5% of faucet balance)
    const faucetBalance = await mysteryBoxFaucet.getFaucetBalance();
    const claimAmount = faucetBalance * BigInt(5) / BigInt(100); // 5% of balance
    
    // User claims tokens
    await mysteryBoxFaucet.connect(user1).claim(claimAmount);
    
    // Check user balance
    expect(await mockToken.balanceOf(user1.address)).to.equal(claimAmount);
    
    // Check faucet balance was reduced
    expect(await mysteryBoxFaucet.getFaucetBalance()).to.equal(faucetBalance - claimAmount);
  });

  it("should reject claims outside the allowed percentage limits", async function () {
    const faucetBalance = await mysteryBoxFaucet.getFaucetBalance();
    
    // Try to claim too little (less than 0.1% of balance)
    const tooSmallAmount = faucetBalance * BigInt(5) / BigInt(10000); // 0.05% of balance
    await expect(mysteryBoxFaucet.connect(user1).claim(tooSmallAmount))
      .to.be.revertedWith("Amount too small");
    
    // Try to claim too much (more than 20% of balance)
    const tooLargeAmount = faucetBalance * BigInt(25) / BigInt(100); // 25% of balance
    await expect(mysteryBoxFaucet.connect(user1).claim(tooLargeAmount))
      .to.be.revertedWith("Amount too large");
  });

  it("should enforce the cooldown period between claims", async function () {
    const faucetBalance = await mysteryBoxFaucet.getFaucetBalance();
    const claimAmount = faucetBalance * BigInt(5) / BigInt(100); // 5% of balance
    
    // First claim should succeed
    await mysteryBoxFaucet.connect(user1).claim(claimAmount);
    
    // Second immediate claim should fail due to cooldown
    await expect(mysteryBoxFaucet.connect(user1).claim(claimAmount))
      .to.be.revertedWith("Cooldown period not elapsed");
    
    // Advance time by 24 hours + 1 second
    await ethers.provider.send("evm_increaseTime", [86401]);
    await ethers.provider.send("evm_mine");
    
    // Now claim should succeed again
    await mysteryBoxFaucet.connect(user1).claim(claimAmount);
  });

  it("should allow the owner to update parameters", async function () {
    // Update cooldown period
    await mysteryBoxFaucet.connect(owner).setCooldownPeriod(3600); // 1 hour
    expect(await mysteryBoxFaucet.claimCooldown()).to.equal(3600);
    
    // Update claim limits
    await mysteryBoxFaucet.connect(owner).setClaimLimits(5, 30); // 0.5% to 30%
    expect(await mysteryBoxFaucet.minClaimPercentage()).to.equal(5);
    expect(await mysteryBoxFaucet.maxClaimPercentage()).to.equal(30);
  });

  it("should prevent non-owners from updating parameters", async function () {
    await expect(mysteryBoxFaucet.connect(user1).setCooldownPeriod(3600))
      .to.be.revertedWithCustomError(mysteryBoxFaucet, "OwnableUnauthorizedAccount");
    
    await expect(mysteryBoxFaucet.connect(user1).setClaimLimits(5, 30))
      .to.be.revertedWithCustomError(mysteryBoxFaucet, "OwnableUnauthorizedAccount");
  });
});
