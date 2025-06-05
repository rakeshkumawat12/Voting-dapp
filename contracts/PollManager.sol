// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./PollStorage.sol";

contract PollManager is PollStorage {
    event PollCreated(
        uint256 indexed pollId,
        string pollName,
        uint256 startTime,
        uint256 endTime
    );

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
            newPoll.candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }

        emit PollCreated(polls.length - 1, _pollName, newPoll.startTime, newPoll.endTime);
    }
}