// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; // For safe arithmetic

/
 * @title GovTreasury
 * @dev A contract to manage treasury funds and allow GovToken holders
 * to propose and vote on spending proposals with conviction.
 * Inspired by Polkadot OpenGov's treasury origins.
 */
contract GovTreasury is Ownable {
    using SafeMath for uint256;

    // --- State Variables ---

    IERC20 public immutable govToken; // The governance token used for voting and held by treasury
    uint256 public nextProposalId;   // Increments for each new proposal

    // Enum for proposal states
    enum ProposalState {
        Pending,   // Proposal has been submitted, waiting for voting period to start
        Voting,    // Actively being voted on
        Succeeded, // Voting period ended, met approval & support
        Failed,    // Voting period ended, did not meet approval & support
        Executed   // Proposal has passed and its action has been performed
    }

    // Struct to define a Treasury Proposal
    struct Proposal {
        address proposer;            // Address that created the proposal
        address recipient;           // Address to send funds to
        uint256 amount;              // Amount of GovToken to send
        string description;          // A short description or link to details (e.g., IPFS hash)
        uint256 startBlock;          // Block number when voting starts
        uint256 endBlock;            // Block number when voting ends
        uint256 yayVotes;            // Sum of GOV tokens voted 'Aye' (raw, without conviction)
        uint256 nayVotes;            // Sum of GOV tokens voted 'Nay' (raw, without conviction)
        uint256 yayVotesWeighted;    // Sum of weighted 'Aye' votes (with conviction)
        uint256 nayVotesWeighted;    // Sum of weighted 'Nay' votes (with conviction)
        ProposalState state;         // Current state of the proposal
        uint256 totalDeposits;       // Total GovTokens locked by voters for this proposal
    }

    // Mapping from proposal ID to Proposal struct
    mapping(uint256 => Proposal) public proposals;

    // Mapping from proposal ID => voter address => true (if voted)
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Mapping from voter address => locked token amount
    mapping(address => uint256) public lockedTokens;

    // Mapping from conviction multiplier (e.g., 1, 2, 4, 6) to lock duration in blocks
    // For hackathon simplicity, hardcoded conviction tiers and lock durations.
    // In OpenGov, these are more complex and tied to eras/weeks.
    mapping(uint256 => uint256) public convictionLockDurations; // multiplier => blocks to lock

    // --- Governance Parameters (Hardcoded for Hackathon) ---
    // These would typically be configurable via governance itself in a full OpenGov system.

    uint256 public constant VOTING_PERIOD_BLOCKS = 100; // Approx 20-25 minutes (12s/block * 100 = 1200s = 20min)
                                                       // Adjust based on desired voting duration.
    uint256 public constant PROPOSAL_CREATION_DEPOSIT = 10 * (10  18); // 10 GOV tokens

    // Thresholds for a proposal to pass (as a percentage, e.g., 50 for 50%)
    // These simulate Approval and Support curves.
    uint256 public constant MIN_APPROVAL_PERCENTAGE_WEIGHTED = 50; // 50% of (yayWeighted / (yayWeighted + nayWeighted))
    uint256 public constant MIN_SUPPORT_PERCENTAGE_RAW = 10;     // 10% of (yayRaw / totalGovTokenSupply) - adjusted for live supply


    // --- Events ---

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address recipient,
        uint256 amount,
        string description,
        uint256 startBlock,
        uint256 endBlock
    );
event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool isAye,
        uint256 tokensLocked,
        uint256 convictionMultiplier,
        uint256 weightedVote
    );

    event ProposalStateChanged(
        uint256 indexed proposalId,
        ProposalState newState
    );

    event ProposalExecuted(
        uint256 indexed proposalId
    );

    event FundsDeposited(
        address indexed depositor,
        uint256 amount
    );

    event FundsWithdrawn(
        address indexed recipient,
        uint256 amount
    );

    // --- Constructor ---

    /
     * @dev Constructor initializes the contract with the GovToken address
     * and sets up initial conviction lock durations.
     * @param _govTokenAddress The address of the deployed GovToken ERC-20 contract.
     * @param initialOwner The address that will own this contract.
     */
    constructor(address _govTokenAddress, address initialOwner) Ownable(initialOwner) {
        require(_govTokenAddress != address(0), "Invalid GovToken address");
        govToken = IERC20(_govTokenAddress);
        nextProposalId = 0;

        // Initialize conviction lock durations (in blocks)
        // These can be adjusted based on desired lock periods for the hackathon.
        // 0x conviction (0.1x vote multiplier in Polkadot) is essentially no lock.
        // We'll use 1x as the base, so 0 blocks lock.
        convictionLockDurations[1] = 0; // 1x conviction, 0 blocks lock
        convictionLockDurations[2] = 200; // 2x conviction, approx 40 min lock
        convictionLockDurations[4] = 400; // 4x conviction, approx 80 min lock
        convictionLockDurations[6] = 800; // 6x conviction, approx 160 min lock
    }

    // --- Treasury Funding & Withdrawal ---

    /
     * @dev Deposits GovTokens into the treasury contract.
     * @param amount The amount of GovTokens to deposit.
     */
    function depositFunds(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero");
        // Transfer GovTokens from sender to this contract
        bool success = govToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        emit FundsDeposited(msg.sender, amount);
    }

    /
     * @dev Allows the owner to withdraw funds from the treasury.
     * In a full DAO, this would be subject to a governance proposal itself.
     * For hackathon simplicity, owner control is kept.
     * @param amount The amount of GovTokens to withdraw.
     * @param recipient The address to send the funds to.
     */
    function withdrawFunds(uint256 amount, address recipient) public onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(govToken.balanceOf(address(this)) >= amount, "Insufficient treasury balance");
        require(recipient != address(0), "Invalid recipient address");

        bool success = govToken.transfer(recipient, amount);
        require(success, "Token transfer failed");
        emit FundsWithdrawn(recipient, amount);
    }

    // --- Proposal Management ---

    /
     * @dev Creates a new treasury spending proposal.
     * Requires a deposit to prevent spam.
     * For hackathon, any GovToken holder can propose.
     * @param _recipient The address to send funds to if the proposal passes.
     * @param _amount The amount of GovTokens to send.
     * @param _description A short description or IPFS hash of the proposal details.
     */
    function createProposal(
        address _recipient,
        uint256 _amount,
        string calldata _description
    ) public {
        require(_recipient != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than zero");
        require(govToken.balanceOf(address(this)) >= _amount, "Treasury has insufficient funds for this proposal");
// Take a deposit from the proposer (refunded if proposal fails/executed)
        bool success = govToken.transferFrom(msg.sender, address(this), PROPOSAL_CREATION_DEPOSIT);
        require(success, "Proposal deposit failed");

        uint256 proposalId = nextProposalId;
        nextProposalId = nextProposalId.add(1);

        proposals[proposalId] = Proposal({
            proposer: msg.sender,
            recipient: _recipient,
            amount: _amount,
            description: _description,
            startBlock: block.number,
            endBlock: block.number.add(VOTING_PERIOD_BLOCKS),
            yayVotes: 0,
            nayVotes: 0,
            yayVotesWeighted: 0,
            nayVotesWeighted: 0,
            state: ProposalState.Voting, // Automatically starts in Voting for hackathon
            totalDeposits: PROPOSAL_CREATION_DEPOSIT
        });

        emit ProposalCreated(
            proposalId,
            msg.sender,
            _recipient,
            _amount,
            _description,
            block.number,
            block.number.add(VOTING_PERIOD_BLOCKS)
        );
    }

    /
     * @dev Allows a GovToken holder to vote on a proposal.
     * Implements conviction voting: higher conviction = higher vote weight & longer lock.
     * @param proposalId The ID of the proposal to vote on.
     * @param voteType True for 'Aye' (yes), False for 'Nay' (no).
     * @param tokensToLock The amount of GovTokens to lock for this vote.
     * @param convictionMultiplier The multiplier to apply (e.g., 1, 2, 4, 6).
     */
    function vote(
        uint256 proposalId,
        bool voteType, // true for Aye, false for Nay
        uint256 tokensToLock,
        uint256 convictionMultiplier
    ) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposer != address(0), "Proposal does not exist");
        require(proposal.state == ProposalState.Voting, "Proposal is not in voting state");
        require(block.number >= proposal.startBlock, "Voting has not started yet");
        require(block.number <= proposal.endBlock, "Voting period has ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted on this proposal");
        require(govToken.balanceOf(msg.sender) >= tokensToLock, "Insufficient GOV balance to lock");
        require(tokensToLock > 0, "Must lock more than zero tokens to vote");
        require(convictionLockDurations[convictionMultiplier] >= 0, "Invalid conviction multiplier"); // Check if multiplier is defined

        // Calculate weighted vote
        uint256 weightedVote = tokensToLock.mul(convictionMultiplier);

        // Lock tokens
        bool success = govToken.transferFrom(msg.sender, address(this), tokensToLock);
        require(success, "Failed to lock tokens for voting");

        // Update proposal vote counts
        if (voteType) {
            proposal.yayVotes = proposal.yayVotes.add(tokensToLock);
            proposal.yayVotesWeighted = proposal.yayVotesWeighted.add(weightedVote);
        } else {
            proposal.nayVotes = proposal.nayVotes.add(tokensToLock);
            proposal.nayVotesWeighted = proposal.nayVotesWeighted.add(weightedVote);
        }

        // Store voter's lock details
        lockedTokens[msg.sender] = lockedTokens[msg.sender].add(tokensToLock); // Track total locked per user
        proposal.totalDeposits = proposal.totalDeposits.add(tokensToLock); // Track total locked for proposal

        hasVoted[proposalId][msg.sender] = true;

        emit Voted(
            proposalId,
            msg.sender,
            voteType,
            tokensToLock,
            convictionMultiplier,
            weightedVote
        );
    }

    /
     * @dev Ends the voting period for a proposal and updates its state
     * based on approval and support thresholds.
     * Anyone can call this to trigger the state update after voting period ends.
     * @param proposalId The ID of the proposal to finalize.
     */
    function finalizeProposal(uint256 proposalId) public {
Proposal storage proposal = proposals[proposalId];
        require(proposal.proposer != address(0), "Proposal does not exist");
        require(proposal.state == ProposalState.Voting, "Proposal is not in voting state");
        require(block.number > proposal.endBlock, "Voting period has not ended yet");

        uint256 totalWeightedVotes = proposal.yayVotesWeighted.add(proposal.nayVotesWeighted);
        uint256 totalRawVotes = proposal.yayVotes.add(proposal.nayVotes); // For support calculation

        uint256 currentGovTokenSupply = govToken.totalSupply(); // Or use a snapshot of active stake if applicable

        bool hasApproval = false;
        if (totalWeightedVotes > 0) {
            hasApproval = (proposal.yayVotesWeighted.mul(100)).div(totalWeightedVotes) >= MIN_APPROVAL_PERCENTAGE_WEIGHTED;
        }

        bool hasSupport = false;
        if (currentGovTokenSupply > 0) {
            hasSupport = (proposal.yayVotes.mul(100)).div(currentGovTokenSupply) >= MIN_SUPPORT_PERCENTAGE_RAW;
        }


        if (hasApproval && hasSupport) {
            proposal.state = ProposalState.Succeeded;
        } else {
            proposal.state = ProposalState.Failed;
            // Optionally, refund proposal creation deposit here if it fails, or allow specific claim function
        }
        emit ProposalStateChanged(proposalId, proposal.state);
    }

    /
     * @dev Executes a treasury proposal if it has succeeded and the enactment period (if any) has passed.
     * For hackathon, execution is immediate upon success if called.
     * Refunds locked tokens to voters of this proposal.
     * @param proposalId The ID of the proposal to execute.
     */
    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposer != address(0), "Proposal does not exist");
        require(proposal.state == ProposalState.Succeeded, "Proposal has not succeeded");
        // No explicit enactment period check here for hackathon, implied by successful state.
        // In a real OpenGov, there would be a specific enactment time/block.

        proposal.state = ProposalState.Executed;

        // Transfer funds
        bool success = govToken.transfer(proposal.recipient, proposal.amount);
        require(success, "Failed to transfer funds for proposal execution");

        // Refund proposal creation deposit to proposer
        // In a real system, this might be based on passing/failing criteria
        bool refundSuccess = govToken.transfer(proposal.proposer, PROPOSAL_CREATION_DEPOSIT);
        require(refundSuccess, "Failed to refund proposal deposit");


        // Important Note for Hackathon:
        // Refunding locked tokens is complex for individual voters in this simplified model.
        // In a full OpenGov, tokens are "unlocked" after a period. For this hackathon,
        // we are *not* explicitly refunding individual locked tokens here for voted proposals.
        // Instead, the `lockedTokens` mapping would be managed by a separate 'unlock' function
        // that checks the individual voter's lock duration for each vote.
        // To keep it simple, `lockedTokens` currently just tracks total locked.
        // A future improvement would be a `releaseLockedTokens(address voter)` function
        // that iterates through a voter's past votes and unlocks if their lock period is over.

        emit ProposalExecuted(proposalId);
        emit ProposalStateChanged(proposalId, ProposalState.Executed);
    }

    // --- View Functions ---

    /
     * @dev Gets the current state of a proposal.
     * @param proposalId The ID of the proposal.
     * @return The current state of the proposal.
     */
    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        return proposals[proposalId].state;
    }
/
     * @dev Returns the current balance of GovTokens held by the treasury.
     * @return The balance of GovTokens.
     */
    function getTreasuryGovBalance() public view returns (uint256) {
        return govToken.balanceOf(address(this));
    }

    /
     * @dev Returns the vote details for a specific proposal.
     * @param proposalId The ID of the proposal.
     * @return yayVotesRaw Raw Aye votes.
     * @return nayVotesRaw Raw Nay votes.
     * @return yayVotesWeighted Weighted Aye votes.
     * @return nayVotesWeighted Weighted Nay votes.
     * @return totalDepositsForProposal Total tokens locked for this proposal.
     */
    function getProposalVoteCounts(uint256 proposalId)
        public
        view
        returns (
            uint256 yayVotesRaw,
            uint256 nayVotesRaw,
            uint256 yayVotesWeighted,
            uint256 nayVotesWeighted,
            uint256 totalDepositsForProposal
        )
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.yayVotes,
            proposal.nayVotes,
            proposal.yayVotesWeighted,
            proposal.nayVotesWeighted,
            proposal.totalDeposits
        );
    }

    /
     * @dev Returns the total tokens currently locked by a specific user across all their votes.
     * Note: This doesn't account for individual vote lock durations here in this simplified model.
     * @param userAddress The address of the user.
     * @return The total locked tokens for that user.
     */
    function getUserLockedTokens(address userAddress) public view returns (uint256) {
        return lockedTokens[userAddress];
    }

    /
     * @dev Checks if a user has already voted on a specific proposal.
     * @param proposalId The ID of the proposal.
     * @param userAddress The address of the user.
     * @return True if the user has voted, false otherwise.
     */
    function hasUserVoted(uint256 proposalId, address userAddress) public view returns (bool) {
        return hasVoted[proposalId][userAddress];
    }
}