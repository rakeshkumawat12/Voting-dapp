import React, { useEffect, useState } from "react";
import { useWeb3Context } from "../context/Web3Context";

const AllPolls = () => {
  const { contractInstance, account, api } = useWeb3Context();
  const [polls, setPolls] = useState([]);
  
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        if (!contractInstance) return;

        const totalPolls = await api.query.contracts.contractInfoOf.getPollCount();
        const pollArray = [];

        for (let i = 0; i < totalPolls; i++) {
          // Destructure the poll data
          pollArray.push({
            name: poll.name,
            creator: poll.creator,
            startTime: Number(poll.startTime),
            endTime: Number(poll.endTime),
          });
        }

        setPolls(pollArray);
      } catch (err) {
        console.error("Error fetching polls:", err);
      }
    };
    fetchPolls();
  }, [contractInstance]);

    const shortenAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-3)}`;
  };

  if (!account) {
    return (
      <div className="text-center mt-10 text-xl font-semibold">
        Please connect your wallet to see polls.
      </div>
    );
  }
  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 sm:py-10 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Ongoing polls
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {polls.map((poll, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition bg-white"
            >
              <p className="text-lg font-semibold mb-2">{poll.name}</p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Creator:</strong>
                {shortenAddress(poll.creator)}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Start:</strong>{" "}
                {new Date(poll.startTime * 1000).toLocaleString()}
                <br />
                <strong>End:</strong>{" "}
                {new Date(poll.endTime * 1000).toLocaleString()}
              </p>
              <button
                onClick={() => handleViewDetails(index)}
                className="w-full text-white bg-gradient-to-r bg-[#e6007a] hover:bg-[#e6007bc8]  hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300  font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer transition"
              >
                View and Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllPolls;
