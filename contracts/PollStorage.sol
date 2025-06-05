// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract PollStorage {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Poll {
        string name;
        uint256 startTime;
        uint256 endTime;
        address creator;
        Candidate[] candidates;
        mapping(address => bool) hasVoted;
    }

    Poll[] internal polls;
}