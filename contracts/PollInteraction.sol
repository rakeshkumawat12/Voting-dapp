// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./PollManager.sol";

// contract PollInteraction {
contract PollInteraction is PollManager {
    event Voted(
        uint256 indexed pollId,
        address indexed voter,
        uint256 indexed candidateIndex
    );

    function vote(uint256 _pollId, uint256 _candidateIndex) external {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];

        require(block.timestamp < poll.endTime, "Voting period is over");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(_candidateIndex < poll.candidates.length, "Invalid candidate");

        poll.hasVoted[msg.sender] = true;
        poll.candidates[_candidateIndex].voteCount++;

        emit Voted(_pollId, msg.sender, _candidateIndex);
    }

    function getPollsLength() external view returns (uint256) {
        return polls.length;
    }

    function getCandidates(uint256 _pollId)
        external
        view
        returns (Candidate[] memory)
    {
        // require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        Candidate[] memory list = new Candidate[](poll.candidates.length);
        for (uint256 i = 0; i < poll.candidates.length; i++) {
            list[i] = poll.candidates[i];
        }
        return list;
    }

    function getWinner(uint256 _pollId)
        external
        view
        returns (string memory, uint256)
    {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        require(block.timestamp >= poll.endTime, "Voting in progress");

        uint256 maxVotes = 0;
        uint256 winnerIndex = 0;
        for (uint256 i = 0; i < poll.candidates.length; i++) {
            if (poll.candidates[i].voteCount > maxVotes) {
                maxVotes = poll.candidates[i].voteCount;
                winnerIndex = i;
            }
        }

        return (
            poll.candidates[winnerIndex].name,
            poll.candidates[winnerIndex].voteCount
        );
    }

    function getPollDetails(uint256 _pollId)
        external
        view
        returns (
            string memory,
            uint256,
            uint256,
            address,
            Candidate[] memory
        )
    {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];

        Candidate[] memory list = new Candidate[](poll.candidates.length);
        for (uint256 i = 0; i < poll.candidates.length; i++) {
            list[i] = poll.candidates[i];
        }

        return (poll.name, poll.startTime, poll.endTime, poll.creator, list);
    }

    function getAllPollsMetadata()
        external
        view
        returns (
            string[] memory names,
            uint256[] memory startTimes,
            uint256[] memory endTimes,
            address[] memory creators
        )
    {
        uint256 len = polls.length;
        names = new string[](len);
        startTimes = new uint256[](len);
        endTimes = new uint256[](len);
        creators = new address[](len);

        for (uint256 i = 0; i < len; i++) {
            Poll storage p = polls[i];
            names[i] = p.name;
            startTimes[i] = p.startTime;
            endTimes[i] = p.endTime;
            creators[i] = p.creator;
        }
    }
}
