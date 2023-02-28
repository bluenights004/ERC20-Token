//This code is writter using the Mocha testing framework, which is commonly used for testing Javascript applications
//It is part of a test suite that is testing some functionality related to 'OnionToken' smart contract.

// The 'beforeEach' function is a hook that is executed before each test case in the suite. In this case, it sets
// up some initial state that is required for the tests to run.

const { expect } = require("chai");
const hre = require("hardhat");

describe("OnionToken contract", function() {
    //global vars
    let Token;
    let onionToken;
    let owner;
    let addr1;
    let addr2;
    let tokenCap = 100000000;
    let tokenBlockReward = 50;

    beforeEach(async function () { // this is a function that sets up a testing environment to run before each test.
     
     Token = await ethers.getContractFactory("OnionToken");// this line uses ethers library to get the contract factory for OnionToken contract.
     [owner, addr1, addr2] = await hre.ethers.getSigners();// uses ethers library to get three signers 'owner', 'addr1', and 'addr2' which are ethereum addresses
                                                            // that can sign and send transactions on the network.

     onionToken = await Token.deploy(tokenCap, tokenBlockReward);//deploys the OnionToken contract using the 'Token' contract factory
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function() {
            expect(await onionToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function() {
            const ownerBalance = await onionToken.balanceOf(owner.address);
            expect(await onionToken.totalSupply()).to.equal(ownerBalance);
        });

        it("Should set the max capped supply to the argument provided during deployment", async function() {
            const cap = await onionToken.cap();
            expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
        });
        
        it("Should set the blockReward to the argument provided during deployment", async function () {
            const blockReward = await onionToken.blockReward();
            expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
          });
        });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
              // Transfer 50 tokens from owner to addr1
              await onionToken.transfer(addr1.address, 50);
              const addr1Balance = await onionToken.balanceOf(addr1.address);
              expect(addr1Balance).to.equal(50);
        
              // Transfer 50 tokens from addr1 to addr2
            // We use .connect(signer) to send a transaction from another account
            await onionToken.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await onionToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
    });
    it("Should fail if sender doesn't have enough tokens", async function () {
        const initialOwnerBalance = await onionToken.balanceOf(owner.address);
        // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
        // `require` will evaluate false and revert the transaction.
        await expect(onionToken.connect(addr1).transfer(owner.address, 1)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  
        // Owner balance shouldn't have changed.
        expect(await onionToken.balanceOf(owner.address)).to.equal(
          initialOwnerBalance
        );
      });

      it("Should update balances after transfers", async function () {
        const initialOwnerBalance = await onionToken.balanceOf(owner.address);
  
        // Transfer 100 tokens from owner to addr1.
        await onionToken.transfer(addr1.address, 100);
  
        // Transfer another 50 tokens from owner to addr2.
        await onionToken.transfer(addr2.address, 50);
  
        // Check balances.
        const finalOwnerBalance = await onionToken.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));
  
        const addr1Balance = await onionToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(100);
  
        const addr2Balance = await onionToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
      });
    });
    
  });

    

