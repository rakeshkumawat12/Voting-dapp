// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenLockingForPoll {
    IERC20 public token;

    struct LockInfo {
        uint256 amount;
        uint256 unlockTime;
        bool withdrawn;
    }

    // Mapping: pollId => user => LockInfo
    mapping(uint256 => mapping(address => LockInfo)) public lockedTokens;

    // Events
    event TokensLocked(address indexed user, uint256 indexed pollId, uint256 amount, uint256 unlockTime);
    event TokensWithdrawn(address indexed user, uint256 indexed pollId, uint256 amount);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    /// @notice Lock tokens for a poll until a given unlock time
    function lockTokensForPoll(uint256 pollId, uint256 amount, uint256 unlockTime) external {
        require(amount > 0, "Amount must be greater than 0");
        require(unlockTime > block.timestamp, "Unlock time must be in the future");

        LockInfo storage lock = lockedTokens[pollId][msg.sender];
        require(lock.amount == 0, "Tokens already locked for this poll");

        // Transfer tokens from user to this contract
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");

        // Record locking details
        lockedTokens[pollId][msg.sender] = LockInfo({
            amount: amount,
            unlockTime: unlockTime,
            withdrawn: false
        });

        emit TokensLocked(msg.sender, pollId, amount, unlockTime);
    }

    /// @notice Withdraw previously locked tokens after unlock time
    function withdrawLockedTokens(uint256 pollId) external {
        LockInfo storage lock = lockedTokens[pollId][msg.sender];

        require(lock.amount > 0, "No tokens locked");
        require(!lock.withdrawn, "Tokens already withdrawn");
        require(block.timestamp >= lock.unlockTime, "Tokens still locked");

        lock.withdrawn = true;

        bool success = token.transfer(msg.sender, lock.amount);
        require(success, "Token transfer failed");

        emit TokensWithdrawn(msg.sender, pollId, lock.amount);
    }

    /// @notice Check locked token amount for a user and poll
    function getLockedAmount(uint256 pollId, address user) external view returns (uint256) {
        return lockedTokens[pollId][user].amount;
    }
}