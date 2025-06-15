// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./PollStorage.sol";

contract PollView is PollStorage {
    function getCandidates(
        uint256 _pollId
    )
        external
        view
        returns (string[] memory names, uint256[] memory voteCounts)
    {
        uint256 len = polls[_pollId].candidates.length;
        names = new string[](len);
        voteCounts = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            names[i] = polls[_pollId].candidates[i].name;
            voteCounts[i] = polls[_pollId].candidates[i].voteCount;
        }
    }

    function getWinner(
        uint256 _pollId
    ) external view returns (string memory winnerName, uint256 winnerVotes) {
        Poll storage poll = polls[_pollId];
        require(block.timestamp >= poll.endTime, "Voting in progress");

        uint256 maxVotes;
        uint256 winnerIndex;

        for (uint256 i = 0; i < poll.candidates.length; i++) {
            if (poll.candidates[i].voteCount > maxVotes) {
                maxVotes = poll.candidates[i].voteCount;
                winnerIndex = i;
            }
        }

        winnerName = poll.candidates[winnerIndex].name;
        winnerVotes = maxVotes;
    }

    function getPollDetails(
        uint256 _pollId
    )
        external
        view
        returns (
            string memory name,
            uint256 startTime,
            uint256 endTime,
            address creator
        )
    {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        return (poll.name, poll.startTime, poll.endTime, poll.creator);
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
            Poll storage poll = polls[i];
            names[i] = poll.name;
            startTimes[i] = poll.startTime;
            endTimes[i] = poll.endTime;
            creators[i] = poll.creator;
        }
    }

    function hasUserVoted(
        uint256 _pollId,
        address _user
    ) external view returns (bool) {
        return polls[_pollId].hasVoted[_user];
    }
}
