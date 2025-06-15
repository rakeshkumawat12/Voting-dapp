// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovToken is ERC20, Ownable {

    uint256 public constant INITIAL_SUPPLY = 1_000_000 * (10 ** 18);


    constructor(address initialOwner)
        ERC20("Governance Token", "GOV")
        Ownable(initialOwner)
    {

        _mint(initialOwner, INITIAL_SUPPLY);
    }

}