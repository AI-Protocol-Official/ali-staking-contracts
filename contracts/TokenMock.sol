// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenMock is ERC20 {
	constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
		_mint(msg.sender, initialSupply);
	}

	function mint(address _to, uint256 _value) public {
		_mint(_to, _value);
	}
}
