// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OriginalMultiSig {
    uint8 public quorum;
    uint8 public noOfValidSigners;
    uint256 public txCount;

    struct Transaction {
        uint256 id;
        uint256 amount;
        address sender;
        address recipient;
        bool isCompleted;
        uint256 timestamp;
        uint256 noOfApproval;
        address tokenAddress;
        address[] transactionSigners;
    }

    struct QuorumUpdate {
      uint256 id;
      uint newQuorum;
      bool isCompleted;
      address sender;
      uint timestamp;
      uint256 noOfApproval;
      address[] transactionSigners;
    }

    mapping(address => bool) public isValidSigner;
    mapping(uint => Transaction) transactions; // txId -> Transaction
    mapping(uint => QuorumUpdate) public quorumUpdates;
    // signer -> transactionId -> bool (checking if an address has signed)
    mapping(address => mapping(uint256 => bool)) hasSigned;

    constructor(uint8 _quorum, address[] memory _validSigners) {
      require(_validSigners.length > 1, "few valid signers");
      require(_quorum > 1, "quorum is too small");


      for(uint256 i = 0; i < _validSigners.length; i++) {
        require(_validSigners[i] != address(0), "zero address not allowed");
        require(!isValidSigner[_validSigners[i]], "signer already exist");

        isValidSigner[_validSigners[i]] = true;
      }

      noOfValidSigners = uint8(_validSigners.length);

      if (!isValidSigner[msg.sender]){
        isValidSigner[msg.sender] = true;
        noOfValidSigners += 1;
      }

      require(_quorum <= noOfValidSigners, "quorum greater than valid signers");
      quorum = _quorum;
    }

    function transfer(uint256 _amount, address _recipient, address _tokenAddress) external {
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");

        require(_amount > 0, "can't send zero amount");
        require(_recipient != address(0), "address zero found");
        require(_tokenAddress != address(0), "address zero found");

        require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "insufficient funds");

        uint256 _txId = txCount + 1;
        Transaction storage trx = transactions[_txId];
        
        trx.id = _txId;
        trx.amount = _amount;
        trx.recipient = _recipient;
        trx.sender = msg.sender;
        trx.timestamp = block.timestamp;
        trx.tokenAddress = _tokenAddress;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);
        hasSigned[msg.sender][_txId] = true;

        txCount += 1;
    }

  function approveTx(uint8 _txId) external {

    uint foundInTransactions = transactions[_txId].noOfApproval;
    uint foundInQuorumUpdates = quorumUpdates[_txId].noOfApproval;

    require(_txId != 0, "invalid tx id");

    require(isValidSigner[msg.sender], "not a valid signer");
    require(!hasSigned[msg.sender][_txId], "can't sign twice");
    
    if(foundInTransactions > 0) {
      Transaction storage trx = transactions[_txId];
      require(IERC20(trx.tokenAddress).balanceOf(address(this)) >= trx.amount, "insufficient funds");
      require(!trx.isCompleted, "transaction already completed");
      require(trx.noOfApproval < quorum, "approvals already reached");

      // for(uint256 i = 0; i < trx.transactionSigners.length; i++) {
      //     if(trx.transactionSigners[i] == msg.sender) {
      //         revert("can't sign twice");
      //     }
      // }

      hasSigned[msg.sender][_txId] = true;
      trx.noOfApproval += 1;
      trx.transactionSigners.push(msg.sender);

      if(trx.noOfApproval == quorum) {
          trx.isCompleted = true;
          IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
      }

    }else if(foundInQuorumUpdates > 0){
      QuorumUpdate storage quds = quorumUpdates[_txId];
      require(!quds.isCompleted, "transaction already completed");
      require(quds.noOfApproval < quorum, "approvals already reached");

      hasSigned[msg.sender][_txId] = true;
      quds.noOfApproval += 1;
      quds.transactionSigners.push(msg.sender);

      if(quds.noOfApproval == quorum) {
        quds.isCompleted = true;
        quorum = uint8(quds.newQuorum);
      }

    }else {
      revert("Transaction Does not exist");
    }
  }

  function updateQuorum(uint _quorum) external {
    require(msg.sender != address(0), "address zero found");
    require(isValidSigner[msg.sender], "invalid signer");
    require(_quorum > 1, "quorum is too small");
    require(_quorum <= noOfValidSigners, "quorum greater than valid signers");

    uint256 _txId = txCount + 1;

    QuorumUpdate storage quds = quorumUpdates[_txId];

    quds.newQuorum = _quorum;
    quds.sender = msg.sender;
    quds.timestamp = block.timestamp;
    quds.noOfApproval = 1;
    quds.id = _txId;
    quds.transactionSigners.push(msg.sender);
    hasSigned[msg.sender][_txId] = true;

    txCount += 1;
  }
}