// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./PollStorage.sol";

contract PollLogic is PollStorage {
    event PollCreated(uint256 indexed pollId, string pollName, uint256 startTime, uint256 endTime);
    event Voted(uint256 indexed pollId, address indexed voter, uint256 indexed candidateIndex);

    function createPoll(
        string memory _pollName,
        string[] memory _candidateNames,
        uint256 _durationInMinutes
    ) external {
        Poll storage newPoll = polls.push();
        newPoll.name = _pollName;
        newPoll.startTime = block.timestamp;
        newPoll.endTime = block.timestamp + (_durationInMinutes * 1 minutes);
        newPoll.creator = msg.sender;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            newPoll.candidates.push(Candidate(_candidateNames[i], 0));
        }

        emit PollCreated(polls.length - 1, _pollName, newPoll.startTime, newPoll.endTime);
    }

    function vote(uint256 _pollId, uint256 _candidateIndex) external {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];

        require(block.timestamp < poll.endTime, "Voting ended");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(_candidateIndex < poll.candidates.length, "Invalid index");

        poll.hasVoted[msg.sender] = true;
        poll.candidates[_candidateIndex].voteCount++;

        emit Voted(_pollId, msg.sender, _candidateIndex);
    }
}