import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
const navigate = useNavigate();
  return (
    <div className="bg-white">

      <div className="relative isolate px-6 lg:px-8">
        {/* gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        {/* middle */}
        <div className="mx-auto max-w-2xl py-32">
          <div className=" sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Empowering Polkadot with  {" "}
              <a href="#" className="font-semibold text-[#e6007a]">
                <span aria-hidden="true" className="absolute inset-0" />
                Decentralized Voting
              </a>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
              Decentralized decision-making and transparent Governance.
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              Powering your DAO with a decentralized voting system that ensures every voting is verifiable, tamper-proof, and trustless.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button onClick={() => navigate("/allpolls")}
                className="rounded-md bg-[#e6007a] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#e6007bc8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Start voting
              </button>
              
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>
    </div>
  );
}
