// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Blue Carbon Credit (BCC)
/// @notice Prototype token for SIH 2025 PS SIH25038.
/// Mint is owner-only (NCCR-style admin) after off-chain MRV + verification.
/// retire() burns tokens so the same offset cannot be resold.
contract CarbonToken is ERC20, Ownable {
    event CreditsIssued(address indexed to, uint256 amount, string projectId);
    event CreditsRetired(address indexed from, uint256 amount, string reason);

    mapping(address => uint256) public retiredBy;

    constructor() ERC20("BlueCarbonCredit", "BCC") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit CreditsIssued(to, amount, "");
    }

    function issueForProject(address to, uint256 amount, string calldata projectId) external onlyOwner {
        _mint(to, amount);
        emit CreditsIssued(to, amount, projectId);
    }

    function retire(uint256 amount, string calldata reason) external {
        require(balanceOf(msg.sender) >= amount, "not enough BCC");
        _burn(msg.sender, amount);
        retiredBy[msg.sender] += amount;
        emit CreditsRetired(msg.sender, amount, reason);
    }
}
