"use client";

import { motion } from "motion/react";
import React from "react";
import { AuroraBackground } from "./ui/aurora-background";

export function ProblemSol() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-2xl">Mission</div>
        <div className="text-xl md:text-2xl font-bold w-[40rem] ">
          There are a lot of online voting platforms that enable us to easily
          create and use polling systems. However, the most common challenge
          faced by these platforms is maintaining high-standard privacy and
          preventing vote tampering.
        </div>
        <div className="font-extralight text-base md:text-xl  w-[40rem] py-4">
          Our team has come up with the concept of building an online voting
          platform that incorporates Blockchain Technology. This Blockchain
          based Voting Dapp built on Polkadot environment provides Security,
          Transparency, Real Time and Verifiable results and Global
          Accessibility which is ideal for DAO's.
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
