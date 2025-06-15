import { useState } from "react";
import logo from "../../src/assets/logo.png";

import web3 from "web3";
import { CONTRACT_POLL_LOGIC_ABI } from "../contractConfig";

const CreatePoll = () => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleCreatePoll = async () => {
    try {
      const filteredOptions = options.filter((opt) => opt.trim() !== "");

      setLoading(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];

      const contractAddress = "0xB21B6886a6015E5efa6CA3e1B3107A702b15f84e";
      const web3Instance = new web3(window.ethereum);

      const contract = new web3Instance.eth.Contract(
        CONTRACT_POLL_LOGIC_ABI,
        contractAddress
      );

      await contract.methods
        .createPoll(title, filteredOptions, duration)
        .send({ from: account });

      alert("Poll created successfully!");

      alert("Poll created successfully!");
      setTitle("");
      setOptions(["", ""]);
      setDuration(1);
    } catch (err) {
      console.error(err);
      alert("Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-6 lg:px-8">
      {/* <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="Voting dapp" src={logo} className="mx-auto h-20 w-auto" />
        <h2 className="mt-2 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Create Poll
        </h2>
      </div> */}

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <div>
          <label
            htmlFor="title"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Poll Title
          </label>
          <div className="mt-1">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="title"
              name="title"
              type="text"
              required
              autoComplete="title"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#e6007a] sm:text-sm/6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="options"
            className="block mt-4 text-sm/6 font-medium text-gray-900"
          >
            Options
          </label>

          <div className="mt-1">
            {options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#e6007a] sm:text-sm/6"
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setOptions([...options, ""])}
          className="text-gray-400 mt-1 hover:underline  cursor-pointer font-regular  hover:text-black"
        >
          + Add Option
        </button>

        <div>
          <label className="mt-4 block text-sm/6 font-medium text-gray-900">
            Time(in minutes)
          </label>

          <div className="mt-1">
            <input
              type="number"
              placeholder="Duration in minutes"
              value={duration}
              min={1}
              onChange={(e) =>
                setDuration(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="border border-gray-300  bg-white  text-zinc-900  p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#e6007a] "
            />
          </div>
        </div>

        <button
          onClick={handleCreatePoll}
          className="text-white px-4 py-2 rounded mt-4 bg-gradient-to-r bg-[#e6007a] hover:bg-[#e6007bc8]  focus:ring-4 focus:outline-none focus:ring-blue-300  transition cursor-pointer w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
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
              Deploying...
            </>
          ) : (
            "Deploy Poll"
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePoll;
