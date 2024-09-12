//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NomCoin is ERC20("NomCoin", "NCOIN") {
  // state variable
  address public owner;

  constructor() {
    owner = msg.sender;
    _mint(msg.sender, 1000000e18);
  }

  error ZeroAddressDetected();
  error CannotMintZero();

  function mintToken(uint _amount) external {
    if (msg.sender == address(0)) { revert ZeroAddressDetected(); }
    if (_amount == 0) { revert CannotMintZero(); }

    uint _amountInWei = _amount * 1e18;
    
    _mint(msg.sender, _amountInWei);
  }
  
}