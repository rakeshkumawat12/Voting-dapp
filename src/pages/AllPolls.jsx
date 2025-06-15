import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";
import { CONTRACT_POLL_LOGIC_ABI } from "../contractConfig";
import Web3 from "web3";

const AllPolls = () => {
  const [polls, setPolls] = useState([]);

  const navigate = useNavigate();

  const now = Math.floor(Date.now() / 1000); // current timestamp in seconds

  const samplePolls = [
  {
    name: "Is Polkadot the best Layer-0 solution?",
    startTime: now - 3600,
    endTime: now + 86400,
    creator: "0x5E9a357e1261BbC01EC81593a19349DbF76caAF3",
  },
  {
    name: "Should native asset issuance on AssetHub be incentivized?",
    startTime: now - 7200,
    endTime: now + 86400,
    creator: "0x7B1a357e1261BbC01EC81593a19349DbF76ca9Cd",
  },
  {
    name: "Which is better for governance: On-chain or Off-chain?",
    startTime: now - 3600,
    endTime: now + 7200,
    creator: "0x9A3a357e1261BbC01EC81593a19349DbF76caf2E",
  },
  {
    name: "What’s the most secure way to manage token assets?",
    startTime: now + 7200,
    endTime: now + 172800,
    creator: "0x1D3a357e1261BbC01EC81593a19349DbF76cafEE",
  },
  {
    name: "Should Polkadot bridge to more EVM chains?",
    startTime: now + 3600,
    endTime: now + 86400,
    creator: "0x8E4a357e1261BbC01EC81593a19349DbF76caBBB",
  },
  {
    name: "Best use case for AssetHub?",
    startTime: now - 1800,
    endTime: now + 43200,
    creator: "0x2F5a357e1261BbC01EC81593a19349DbF76caAAA",
  },
];

  useEffect(() => {
    setPolls(samplePolls);
  }, []);

  const shortenAddress = (address) =>
    `${address.slice(0, 5)}...${address.slice(-3)}`;

  const handleViewDetails = (index) => {
    navigate(`/poll/${index}`, { state: { poll: polls[index] } });
  };

  const nowTs = Math.floor(Date.now() / 1000);

  const ongoingPolls = polls.filter(
    (p) => nowTs >= p.startTime && nowTs < p.endTime
  );
  const upcomingPolls = polls.filter((p) => nowTs < p.startTime);
  const endedPolls = polls.filter((p) => nowTs >= p.endTime);

  const renderPollSection = (title, pollList) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
        {title}
      </h2>
      {pollList.length === 0 ? (
        <p className="text-gray-600">No polls available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {pollList.map((poll, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition bg-white"
            >
              <p className="text-lg font-semibold mb-2">{poll.name}</p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Creator:</strong> {shortenAddress(poll.creator)}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Start:</strong>{" "}
                {new Date(poll.startTime * 1000).toLocaleString()} <br />
                <strong>End:</strong>{" "}
                {new Date(poll.endTime * 1000).toLocaleString()}
              </p>
              <button
                onClick={() => handleViewDetails(index)}
                className="w-full text-white bg-[#e6007a] hover:bg-[#e6007bf0] font-medium rounded-md text-sm px-5 py-2.5 text-center transition cursor-pointer"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {renderPollSection("Ongoing (LIVE) Polls", ongoingPolls)}
      {renderPollSection("Upcoming Polls", upcomingPolls)}
      {renderPollSection("Ended Polls", endedPolls)}

      <button
        className="bg-[#e6007a] text-white px-4 py-1 rounded-md border-2 cursor-pointer  flex m-auto p-2"
        onClick={() => navigate("/createpoll")}
      >
        Create Poll
      </button>
    </div>
  );
};

export default AllPolls;
