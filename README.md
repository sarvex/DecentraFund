# DecentraFund Crowdfunding DApp

A decentralized application (DApp) for transparent and secure crowdfunding using blockchain technology. Users can create and support fundraising campaigns in a decentralized, trustless environment.

---

## Project Overview

DecentraFund enables users to launch and contribute to crowdfunding campaigns on Ethereum. The platform leverages smart contracts for transparency and security, with a modern React.js frontend and robust blockchain integration.

---

## Technical Requirements

### Smart Contract Integration (Solidity)
- Audit and optimize the current smart contract codebase for performance and security.
- Validate proper event emission for seamless frontend interaction.
- Incorporate incremental enhancements, such as campaign categorization, badges, or expanded withdrawal conditions.
- Conduct thorough testing using Hardhat to simulate edge cases and ensure contract reliability.

### Blockchain Interaction (Web3.js)
- Maintain robust wallet connectivity and transaction handling.
- Implement reliable smart contract calls to retrieve campaign details and handle contributions.
- Extend event-based listeners to improve real-time frontend responsiveness.
- Ensure graceful handling of wallet/network changes, transaction rejections, and account switches.

### Frontend Development (React.js)
- Existing Pages (Completed):
  - Home Page
  - Campaign Creation Page
- New Pages (To Be Developed):
  - Campaign Detail Page: Display comprehensive campaign data, funding progress, and contribution interface.
  - User Dashboard: Personalized views for campaign creators and contributors, including history and campaign management.
  - Admin Panel (Optional): Dashboard for administrative oversight and moderation capabilities.
- Enhancements:
  - Improve overall UI/UX for responsiveness, accessibility, and performance.
  - Integrate campaign filtering, sorting, and keyword-based search functionalities.
  - Apply consistent design principles and reusable component architecture.
- Technologies:
  - React.js with JavaScript
  - Preferred: Zustand or Redux for state management
  - Optional: TailwindCSS for styling

### Deployment & Quality Assurance
- Verify contract deployment on Ethereum testnets (e.g., Goerli, Sepolia).
- Host the frontend using modern deployment platforms (Vercel, Netlify, AWS S3).
- Develop and maintain automated integration and end-to-end tests.
- Implement monitoring, analytics, and error tracking tools (e.g., Sentry, LogRocket).

### Documentation & Workflow
- Maintain up-to-date technical documentation, including smart contract ABIs and frontend setup.
- Provide a clean and reproducible development environment.
- Utilize GitHub for source control, collaboration, code reviews, and issue tracking.
- Establish regular communication cadence to provide progress updates and address blockers.

---

## Required Skills
- Advanced proficiency in Solidity and smart contract development on Ethereum
- Strong frontend development experience using React.js and JavaScript
- Proficiency in Web3.js or ethers.js for blockchain integration
- Hands-on experience with Hardhat for contract testing and deployment
- Familiarity with Git, version control workflows, and Agile methodologies

### Preferred Qualifications
- UI/UX design capabilities
- Understanding of decentralized storage solutions (e.g., IPFS)
- Experience with The Graph protocol, ENS, or Layer 2 scaling networks
- Exposure to smart contract security best practices and analytics tools

---

## Contact & Application Instructions
Qualified candidates who are enthusiastic about decentralized technologies and crowdfunding innovation are encouraged to apply. Please include the following in your submission:
- GitHub or GitLab profile with relevant repositories
- Portfolio of previous DApp or blockchain-related work
- Brief cover note outlining your interest in the project and relevant experience

We look forward to collaborating with passionate developers to shape the future of decentralized crowdfunding.

---

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Solidity.**

Foundry consists of:
-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
