export default function FAQs() {
  return (
    <section
      id="faqs"
      className="scroll-py-32 bg-white py-32 dark:bg-transparent"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
          <div className="text-center lg:text-left">
            <h2 className="text-title mb-4 text-3xl font-semibold md:text-4xl">
              Frequently <br className="hidden lg:block" /> Asked{" "}
              <br className="hidden lg:block" />
              Questions
            </h2>
            <p>More about us</p>
          </div>

          <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
            <div className="pb-6">
              <h3 className="text-title font-medium">
                What is a DAO voting Dapp?
              </h3>
              <p className="text-body mt-4">
                A decentralized application that allows DAOs to manage proposals
                and votes transparently using blockchain smart contracts.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-title font-medium">
                How is Decentralized voting different from traditional voting?
              </h3>
              <p className="text-body mt-4">
                It is fully tamper proof, on chain, transparent and provides a
                decision making process for DAO governance.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-title font-medium">
                Is the voting process secure?
              </h3>
              <p className="text-body my-4">
                Yes, the voting process is secure and no individual can cast
                extra votes.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-title font-medium">
                How are the voting results calculated?
              </h3>
              <p className="text-body mt-4">
                Votes are counted automatically by smart contracts, and anyone can check the results directly on the blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
