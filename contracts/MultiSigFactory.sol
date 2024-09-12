// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./OriginalMultiSig.sol";

contract MultiSigFactory {

  OriginalMultiSig[] public multiSigClones;

  event MultiSigWalletCreate(OriginalMultiSig newContract, uint timeStamp, uint _length);

  function createMultiSig(uint8 _quorum, address[] memory _signers) external {
    OriginalMultiSig newContract = new OriginalMultiSig(_quorum, _signers);

    multiSigClones.push(newContract);
    uint time = block.timestamp;

    emit MultiSigWalletCreate(newContract, time, multiSigClones.length);
  }

  function getClonedContract() view external returns( uint ) {
    return multiSigClones.length;
  }
}