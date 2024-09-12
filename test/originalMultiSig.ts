import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("MultiSig", function () {

  async function getSigners() {

    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4] = await hre.ethers.getSigners();

    const MultiSig = await hre.ethers.getContractFactory("OriginalMultiSig");

    const signersArray = [account1, account2, account3, account4];
    const _quorum = 3;

    const multiSig = await MultiSig.deploy(_quorum, signersArray);

    return { multiSig, owner, account1, account2, account3, _quorum, signersArray};
  }

  describe("Deployment", function() {
    it("Should confirm quorum is rightly set", async function() {
      const {  _quorum, multiSig, signersArray } = await loadFixture(getSigners);


      expect(await multiSig.quorum()).to.be.greaterThan(1);
      expect(await multiSig.quorum()).to.equal(_quorum);
      expect(await multiSig.quorum()).to.be.lessThanOrEqual(signersArray.length);
      
    })

    it("Should confirm account registration", async function() {
      const { multiSig, signersArray } = await loadFixture(getSigners);

      expect(await multiSig.noOfValidSigners()).to.be.greaterThan(1);
      expect(await multiSig.noOfValidSigners()).to.equal(signersArray.length + 1);
    })

    it("should recognize valid signers", async function () {
      const { multiSig, owner, account1, account2, account3} = await loadFixture(
        getSigners
      );

      expect(await multiSig.isValidSigner(account1.address)).to.be.true;
      expect(await multiSig.isValidSigner(account2.address)).to.be.true;
      expect(await multiSig.isValidSigner(account3.address)).to.be.true;
      expect(await multiSig.isValidSigner(owner.address)).to.be.true;
    });

  })

  describe("Update Quorum", function() {
    it("Should check value is greaterThan 1", async function() {
      const { multiSig } = await loadFixture(getSigners);

      const newQuorum = 1;

      await expect(multiSig.updateQuorum(newQuorum)).to.be.revertedWith("quorum is too small");
    })

    it("Should ensure value NOtGreaterThan length of registered Signers", async function () {
      const { multiSig, signersArray } = await loadFixture(getSigners);

      const newQuorum = 3;

      expect(await multiSig.noOfValidSigners()).to.be.greaterThanOrEqual(newQuorum);
    })
  })

  it("Should check value is greaterThan registered Signers", async function() {
    const { multiSig } = await loadFixture(getSigners);

    const newQuorum = 8;

    await expect(multiSig.updateQuorum(newQuorum)).to.be.revertedWith("quorum greater than valid signers");
  })

  it("Should check value is greaterThan registered Signers", async function() {
    const { multiSig, signersArray, owner, account2 } = await loadFixture(getSigners);

    const newQuorum = 3;
    await multiSig.updateQuorum(newQuorum);
    // multiSig.quorumUpdates();

    const trx = await multiSig.quorumUpdates(1);

    // expect(await multiSig.quorumUpdates(trx.id)).to.equal(1);
    // expect(await multiSig.isValidSigner(account2.address)).to.be.true;
  })

  // describe("Transaction Approval", function () {

  //   it("it should allow signers to approve a transaction", async function () {
  //     const { multiSig, owner, account1, account2 } = await loadFixture(getSigners);
  //     await multiSig.connect(account1).approveTx(1);
  //     const tx = await multiSig.quorumUpdates(1);
  //     expect(tx.noOfApproval).to.equal(2);
  //   });

  //   it("it should executes the transaction after quorum approval", async function() {
  //     const { multiSig, owner, account1, account2 } = await loadFixture(getSigners);
  //     // const initialRecipientBalance = await web3CXIContract.balanceOf(signers[3].address);
  //     await multiSig.connect(account1).approveTx(1);

  //     // const finalRecipientBalance = await web3CXIContract.balanceOf(signers[3].address);

  //     const amount = hre.ethers.parseEther("10");
  //     // expect( finalRecipientBalance - initialRecipientBalance).to.equal(amount)

  //     const tx = await multiSig.quorumUpdates(1);
  //     expect(tx.noOfApproval).to.equal(2);

  //   });

  //   it("it should revert if a signer tries to approve twice", async function() {
  //     const { multiSig, owner, account1, account2 } = await loadFixture(getSigners);
  //     await multiSig.connect(account2).approveTx(1);
  //     await expect( multiSig.connect(account2).approveTx(1)).to.be.revertedWith("can't sign twice");

  //   });
  // });

 
});

describe("MultiSigFactory", function() {
  async function createMultiSig() {
    const [owner, account1, account2, account3, account4] = await hre.ethers.getSigners();

    const MultiSigFactory = await hre.ethers.getContractFactory("MultiSigFactory");

    const signersArray = [account1, account2, account3, account4];
    const _quorum = 3;

    const multiSigFactory = await MultiSigFactory.deploy();

    return { multiSigFactory, owner, account1, account2, account3, _quorum, signersArray};
  }

  describe("Quorum Test", function(){
    it("Should Create new contract", async function(){
      const { _quorum, signersArray, multiSigFactory } = await loadFixture(createMultiSig);

      const newContract = await multiSigFactory.createMultiSig(_quorum, signersArray);
      const multiSigClones = await multiSigFactory.getClonedContract();

      // console.log(multiSigClones);

      expect(multiSigClones).to.equal(1);
      expect(newContract).to.emit(multiSigFactory, "MultiSigWalletCreate");
    })

    it("Should only accept values greater than 1", async function() {
      const { multiSigFactory, signersArray } = await loadFixture(createMultiSig);

      const _quorum = 0;
      const newContract = multiSigFactory.createMultiSig(_quorum, signersArray);

      expect(newContract).to.be.rejectedWith("quorum is too small");
    })

    it("Value must not exceed signers.length", async function() {
      const { multiSigFactory, signersArray } = await loadFixture(createMultiSig);

      const _quorum = 10;
      const newContract = multiSigFactory.createMultiSig(_quorum, signersArray);

      expect(newContract).to.be.rejectedWith("quorum greater than valid signers");
    })

    describe("Signer Registration", function(){
      it("Should ensure signers are more than 1", async function() {
        const { multiSigFactory, signersArray, _quorum } = await loadFixture(createMultiSig);

        const [owner] = await hre.ethers.getSigners();

        const signers = [owner];

        expect(multiSigFactory.createMultiSig(1, signers)).to.be.revertedWith("few valid signers");
      })
    })

  })
})

// const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// describe("SolomonMSG", function () {
//   async function deploySolomonMSG() {
//     const signers = await hre.ethers.getSigners();
//     const SolomonMSG = await hre.ethers.getContractFactory("OriginalMultiSig");
//     const web3CXI = await hre.ethers.getContractFactory("Web3CXI");

//     const QUORUM = 2;
//     const validSigners = [
//       signers[0].address,
//       signers[1].address,
//       signers[2].address,
//     ];
//     const transferAmount = hre.ethers.parseEther("1000");

//     const solomonMSG = await SolomonMSG.deploy(QUORUM, validSigners);
//     const web3CXIContract = await web3CXI.deploy();
//     await web3CXIContract.transfer(
//       await solomonMSG.getAddress(),
//       transferAmount
//     );

//     return {
//       QUORUM,
//       validSigners,
//       solomonMSG,
//       web3CXIContract,
//       transferAmount,
//       signers,
//     };
//   }


//   describe("Transaction Submission", function () {
//     it("it should submit submits a transaction", async function () {
//       const { solomonMSG, web3CXIContract, signers } = await loadFixture(
//         deploySolomonMSG
//       );
//       const amount = hre.ethers.parseEther("100");
//       await solomonMSG.transfer(
//         amount,
//         signers[3].address,
//         await web3CXIContract.getAddress()
//       );
//       const tx = await solomonMSG.transactions(1);
//       expect(tx.recipient).to.equal(signers[3].address);
//       expect(tx.amount).to.equal(amount);
//       expect(tx.isCompleted).to.be.false;
//     });
//     it("it should revert if a non signer submits a transaction", async function () {
//       const { solomonMSG, web3CXIContract, signers } = await loadFixture(
//         deploySolomonMSG
//       );
//       const amount = hre.ethers.parseEther("10");
//       await expect(
//         solomonMSG
//           .connect(signers[4])
//           .transfer(
//             amount,
//             signers[4].address,
//             await web3CXIContract.getAddress()
//           )
//       ).to.be.revertedWith("invalid signer");
//     });
//   });

//   describe("update of Quorum", function () {});
// });