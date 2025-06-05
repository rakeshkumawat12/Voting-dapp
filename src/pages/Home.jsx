import React, { useEffect, useState } from "react";
import {
  web3Enable,
  web3Accounts,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import contractMetadata from "../../abi.json";

const CONTRACT_ADDRESS = "0x9968828F9202F5e19438c2fA781C43dDaf19454D";
const NODE_URL = "wss://paseo-rpc.dwellir.com";

function Home() {
  const [api, setApi] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState("");
  const [duration, setDuration] = useState("");
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const connect = async () => {
      const provider = new WsProvider(NODE_URL);
      const _api = await ApiPromise.create({ provider });
      setApi(_api);
    };
    connect();
  }, []);

  const connectWallet = async () => {
    if (!api) {
      alert("API not ready. Please wait for connection to establish.");
      return;
    }

    const extensions = await web3Enable("My Voting DApp");
    if (!extensions.length) {
      alert("Polkadot.js extension not found or access denied");
      return;
    }

    const allAccounts = await web3Accounts();
    if (allAccounts.length === 0) {
      alert("No accounts found");
      return;
    }

    const selectedAccount = allAccounts[0];
    setAccount(selectedAccount);
    // console.log(api, contractMetadata, CONTRACT_ADDRESS);

    const contractInstance = new ContractPromise(
      api,
      contractMetadata,
      CONTRACT_ADDRESS
    );
    setContract(contractInstance);
  };

  const createPoll = async () => {
    // console.log(contract);

    if (!contract || !account || !api) {
      alert("Contract, account, or API not ready.");
      return;
    }
    const injector = await web3FromAddress(account.address);
    const optArray = options.split(",").map((opt) => opt.trim());

    const tx = contract.tx.createPoll(
      { gasLimit: -1 },
      question,
      optArray,
      parseInt(duration)
    );
    const unsub = await tx.signAndSend(
      account.address,
      { signer: injector.signer },
      (result) => {
        if (result.status.isInBlock || result.status.isFinalized) {
          alert("Poll created successfully");
          unsub();
        }
      }
    );
  };

  const vote = async (pollId, optionIndex) => {
    const injector = await web3FromAddress(account.address);
    const tx = contract.tx.vote({ gasLimit: -1 }, pollId, optionIndex);
    const unsub = await tx.signAndSend(
      account.address,
      { signer: injector.signer },
      (result) => {
        if (result.status.isInBlock || result.status.isFinalized) {
          alert("Vote casted");
          unsub();
        }
      }
    );
  };

  const getVoteCount = async (pollId, optionIndex) => {
    const { output } = await contract.query.getVotes(
      account.address,
      { gasLimit: -1 },
      pollId,
      optionIndex
    );
    alert(`Votes for option ${optionIndex}: ${output.toHuman()}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {!account ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4 ">
            <h1 className="text-3xl font-bold">Voting DApp</h1>
            <button
              className="px-4 py-2 cursor-pointer bg-[#e6007a] text-white rounded hover:bg-[#e6007bd2]"
              onClick={connectWallet}
            >
              Connect Polkadot Wallet
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-lg text-gray-600 mb-4">
             <b>Connected:</b> <span className="font-medium">{account.meta.name}</span>{" "}
            ({account.address})
          </p>

          <hr className="my-6 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Create Poll</h2>

            <input
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Question/Discussion"
              onChange={(e) => setQuestion(e.target.value)}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Options (comma separated)"
              onChange={(e) => setOptions(e.target.value)}
            />
            <input
              placeholder="Duration (in minutes)"
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <button onClick={createPoll} className="px-4 py-2 bg-[#e6007a]  text-white rounded hover:bg-[#e6007bd2] cursor-pointer">Create</button>
          </section>

          <hr className="my-6 border-gray-300" />

          <section>
            <h2 className="text-xl font-semibold mb-4">Polls</h2>
            {polls.length === 0 ? (
              <p className="text-gray-500">No polls available yet.</p>
            ) : (
              polls.map((poll) => (
                <div
                  key={poll.id}
                  className="mb-6 p-4 border border-gray-200 rounded shadow-sm"
                >
                  <h3 className="text-lg font-medium mb-2">{poll.question}</h3>
                  <ul className="space-y-2">
                    {poll.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span>{opt}</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => vote(poll.id, idx)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Vote
                          </button>
                          <button
                            onClick={() => getVoteCount(poll.id, idx)}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                          >
                            View Votes
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
