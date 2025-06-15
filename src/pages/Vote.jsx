import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import { CONTRACT_VOTING } from "../contractConfig";

const Vote = () => {
  const [isVoting, setIsVoting] = useState(false);
  const [winner, setWinner] = useState(null);
  const [voted, setVoted] = useState(false);
  const [pollDetails, setPollDetails] = useState({
    name: "Is Polkadot the best Layer-0 solution?",
    startTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    endTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour later
    creator: "0x5E9a357e1261BbC01EC81593a19349DbF76caAF3",
    candidateNames: ["Yes", "No", "Maybe"],
    voteCounts: [298, 3, 21],
  });

  const [showVotes, setShowVotes] = useState(false);

  const { pollId } = useParams();

  const contractAddress = "0x258033d233c835ddBf92db4C1aA42635582d8D50";

  const fetchPollDetails = async () => {
    try {
      // if (!window.ethereum) throw new Error("MetaMask not found");
      // await window.ethereum.request({ method: "eth_requestAccounts" });
      // const web3 = new Web3(window.ethereum);
      // const contract = new web3.eth.Contract(CONTRACT_VOTING, contractAddress);
      // const numericPollId = Number(pollId);
      // const result = await contract.methods.getPollDetails(numericPollId).call();
      // const [name, startTime, endTime, creator, candidateNames, voteCounts] = result;
      // setPollDetails({
      //   name,
      //   startTime: Number(startTime),
      //   endTime: Number(endTime),
      //   creator,
      //   candidateNames,
      //   voteCounts: voteCounts.map(Number),
      // });
    } catch (err) {
      console.error("Error fetching poll details:", err);
      alert("Error fetching poll details. Check console.");
    }
  };

  useEffect(() => {
    fetchPollDetails();
  }, [pollId]);

  const vote = async (idx) => {
    try {
      setIsVoting(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];

      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(CONTRACT_VOTING, contractAddress);

      await contract.methods.vote(pollId, idx).send({ from: account });

      setVoted(true);
      fetchPollDetails();
    } catch (err) {
      console.error("Voting error:", err);
    } finally {
      setIsVoting(false);
    }
  };

  const fetchWinner = () => {
    const maxVotes = Math.max(...pollDetails.voteCounts);
    const winnerIndex = pollDetails.voteCounts.indexOf(maxVotes);
    setWinner(pollDetails.candidateNames[winnerIndex]);
  };

  if (!pollDetails)
    return <p className="p-4 text-gray-500">Loading poll details...</p>;

  const isPollEnded = Date.now() / 1000 > pollDetails.endTime;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{pollDetails.name}</h1>
      <p className="text-gray-500 mb-2">Created by: {pollDetails.creator}</p>
      <p>
        Start: {new Date(pollDetails.startTime * 1000).toLocaleString()} - End:{" "}
        {new Date(pollDetails.endTime * 1000).toLocaleString()}
      </p>

      <div className="mt-6">
        {pollDetails.candidateNames.map((candidate, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border p-3 my-2 rounded"
          >
            <span>
              {candidate}{" "}
              {showVotes && (
                <span className="text-gray-500">
                  ({pollDetails.voteCounts[idx]} votes)
                </span>
              )}
            </span>
            <button
              onClick={() => vote(idx)}
              className="bg-[#e6007a] text-white px-4 py-1 rounded border-2 cursor-pointer"
              disabled={voted || isPollEnded}
            >
              Vote
            </button>
          </div>
        ))}
      </div>

      <button
        className="bg-green-600 text-white px-4 py-2 mt-6 rounded cursor-pointer"
        onClick={() => setShowVotes(true)}
      >
        Result
      </button>

      {showVotes && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Yes is winner</h2>
        </div>
      )}

      {voted && <p className="text-green-600 mt-4">✅ Voted successfully!</p>}

      {isPollEnded && (
        <>
          <p className="text-xl text-black my-3">🕒 Voting Closed</p>
          <button
            className="bg-green-600 text-white px-4 py-2 mt-6 rounded cursor-pointer"
            onClick={fetchWinner}
          >
            Show Winner
          </button>
          {winner && (
            <p className="text-xl mt-4 text-black">🏆 Winner: {winner}</p>
          )}
        </>
      )}

      {isVoting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="text-lg font-medium text-blue-700">
              Voting in progress...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vote;
