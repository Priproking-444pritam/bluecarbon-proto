# BlueCarbon Registry

Prototype for **Smart India Hackathon 2025**, problem **SIH25038**: *Blockchain-Based Blue Carbon Registry and MRV System*, organization **Ministry of Earth Sciences (MoES)**, theme **Clean & Green Technology**.

This README is written so you can explain the project in an interview: what it is, why it exists, what each screen does, how blockchain fits, what is real vs demo, and the usual follow-up topics. It does **not** list interview questions.

---

## 30-second pitch

India wants coastal ecosystems (mangroves, seagrass, salt marsh) restored because they store carbon in plants and wet soil. Credits from that work are only useful if people trust the numbers. This project is a **registry**: NGOs and panchayats register a site, field/drone-style data is recorded (MRV), a verifier checks it, then carbon credits can be **tokenized** (BCC) and later **retired** so the same tonne is not sold twice.

The app is a **working prototype**, not a production NCCR system. Projects and the audit trail live in the browser. A Solidity contract exists to show mint and retire on a local chain.

---

## Official problem (what SIH asked for)

**PS number:** SIH25038  
**Title:** Blockchain-Based Blue Carbon Registry and MRV System  
**Department:** Ministry of Earth Sciences. In real government work this sits next to **NCCR** (National Centre for Coastal Research) as the scientific/admin body for coastal carbon accounting.

The brief, in substance:

- There is no widely used **decentralized, verifiable MRV** for Indian blue carbon restoration.
- Build a **blockchain-backed registry** where plantation/restoration data is hard to tamper with.
- **Tokenize** verified carbon credits with smart contracts.
- Onboard **NGOs, communities, coastal panchayats**.
- Take **field data** from apps and drones (and, in a full design, sensors).
- Give **admin tools** for a national body (NCCR-style).

This repo covers that pipeline as a **web demo** plus a small **ERC-20** contract. There is no native mobile app; the MRV screen stands in for field upload.

---

## Domain you must be able to explain

### Blue carbon

Carbon stored in **coastal and marine** ecosystems, mainly:

| Ecosystem | Why it stores carbon |
| --- | --- |
| Mangroves | Trees plus deep, waterlogged soil; common on Indian coasts (Sundarbans, Bhitarkanika, Pichavaram, Gujarat, Andamans). |
| Seagrass | Underwater flowering plants; meadows bury carbon in sediment (e.g. Gulf of Mannar). |
| Salt marsh / coastal wetland | Tidal grasses; anaerobic soil slows decay. |

Compared with many inland forests, a hectare of mangrove/seagrass can store a **large share of carbon below ground**. If the ecosystem is destroyed, that carbon can return to the atmosphere. Restoration + protection is both climate policy and coastal protection (storms, erosion, fisheries).

### MRV

**Monitoring, Reporting, Verification** — the same idea used in carbon markets and IPCC-style inventories.

1. **Monitoring:** measure the site over time (plots, GPS, survival counts, soil cores, drone imagery, sensors).
2. **Reporting:** turn measurements into a claim (tCO₂e sequestered or avoided), with methodology and evidence.
3. **Verification:** an independent party checks the claim before credits are issued.

Without MRV, a “carbon credit” is just a number in a spreadsheet.

### Why blockchain is in the problem statement

Blockchain is **not** used here to estimate carbon. Estimation is science (ecology + methodology). Blockchain is used for **trust and settlement**:

- **Immutability / audit trail:** once a hash or issuance is recorded, changing history is obvious.
- **Single registry:** reduces **double counting** (same plantation sold to two buyers).
- **Smart contracts:** rules for **mint** (issue) and **retire** (use and burn) instead of a private Excel file.
- **Shared view:** NGO, verifier, NCCR, and buyer can see the same ledger.

Honest limitation: a public chain does not magically make GPS points true. Garbage in, garbage on-chain. Verification and field methods still matter. Many real systems put **hashes** of documents on-chain and keep heavy files off-chain (IPFS or government storage).

### Tokenization

A verified tonne becomes a **token** (here **BCC**, 18 decimals, ERC-20). Transfer = change of owner. **Retirement** burns the token and records that an offset was claimed. After retirement it must not be sold again.

### Double counting

Same physical carbon claimed twice: two registries, two buyers, or selling a credit that was already retired. Controls: one national registry, unique project IDs, issuance only after verify, retirement that burns supply.

### Roles (as in the SIH brief)

| Role in this app | Who it represents | What they do |
| --- | --- | --- |
| NGO / Panchayat | Project proponent, community | Register site, upload MRV snapshots |
| Verifier | Independent checker | Review evidence, approve / reject / request more review |
| NCCR Admin | National registry operator | See everything, issue and retire credits, optional on-chain mint |

The role dropdown is **demo only** (no login). In production you would use authentication and on-chain roles (`onlyOwner` / AccessControl).

---

## What this prototype actually does

End-to-end path you can click:

1. **Register** a restoration project (geo, ecosystem, area, document *names*).
2. **Manage** the list (search, status, issued vs retired).
3. **MRV** — add a snapshot labelled Field app / Drone / Sensor with a tCO₂ figure.
4. **Verification** — change status, write notes, **issue credits** from MRV totals.
5. **Blockchain** — local audit trail; optional MetaMask **mint** / **retire** against `CarbonToken`.
6. **Dashboard** — counts, map of Indian sample sites, credits by ecosystem, recent events.

Data is stored in **`localStorage`**. Reset demo data from the top bar. Seed projects: Sundarbans, Pichavaram, Bhitarkanika, Gulf of Mannar.

Carbon math in registration is a **toy formula**: `area (ha) × rate (tCO₂/ha/year)` with rough rates in `src/data/carbon.js`. Real projects use approved methodologies (plot biomass, soil carbon, leakage, uncertainty). Say that clearly if asked.

---

## Screens and functions

### Dashboard

- Totals: project count, issued credits, pending verification, retired credits.
- Simple chart of issued / retired / circulating.
- Leaflet map of registered coordinates (India-centred).
- Breakdown by ecosystem.
- Last registry events.

### Register Project

Four steps: identity → location → ecosystem/area/files → review. Draft autosaves. Submit writes into the shared registry (not only an alert).

### Manage Projects

Table of all projects. Search. **Add New Project** opens Register.

### MRV Dashboard

Counts of snapshots and reported tCO₂. Form to attach a snapshot to a project (NGO or Admin). Chart is a demo aggregation of those rows.

### Verification

Queue of projects, evidence list, notes. Verifier/Admin: under review, approve, reject. Admin: **Issue credits** (sum of MRV tCO₂, or a prompt). This is the off-chain stand-in for “NCCR signs issuance.”

### Blockchain

- MetaMask connect (address, ETH balance, chain id).
- Paste deployed `CarbonToken` address → mint 10 BCC (owner-only on chain).
- On-chain `retire`.
- Local retire against a project (always works without a chain).
- Audit table of REGISTER / MRV / VERIFY / ISSUE / RETIRE / CHAIN events.

---

## Architecture

```
Browser (React + Vite)
  ├── Role switch (demo)
  ├── Registry state (localStorage)
  │     projects, MRV rows, credits, ledger events
  └── Optional Web3 (ethers v6)
        MetaMask  →  CarbonToken (ERC-20)
                        mint / issueForProject / retire (burn)

Contracts (Hardhat)
  CarbonToken.sol  — OpenZeppelin ERC20 + Ownable
```

**Intended production shape** (say this; it is not all built):

- Mobile app / drone pipeline → object store + **content hash**.
- Backend / NCCR console → verification workflow, user accounts.
- Smart contract → store project id + hash + issued/retired amounts; tokens to community or buyer wallets.
- Maybe a permissioned or public L2 for cost, not a toy chain.

Frontend talks to the chain only for token actions. Scientific data stays off-chain with hashes — a standard interview talking point (cost, privacy, file size).

---

## Smart contract (`contracts/contracts/CarbonToken.sol`)

| Piece | Meaning |
| --- | --- |
| `ERC20("BlueCarbonCredit", "BCC")` | Fungible credit token |
| `Ownable` | Only admin (deployer) may mint — like NCCR |
| `mint` / `issueForProject` | Create supply after off-chain verification |
| `retire` | Burn + `retiredBy` mapping + event |
| Events `CreditsIssued` / `CreditsRetired` | Indexers / auditors |

Not in this small contract (you can name them as **next steps**): project struct on-chain, verifier addresses, pausing, batch issuance, royalty split to panchayat wallets, NFT per project vs fungible tonnes.

**Why ERC-20 not NFT?** Each token unit is one interchangeable tonne after verification. Project identity lives in the registry id passed to `issueForProject`. A serialised credit (NFT) is an alternative if every tonne must stay unique.

Deploy script uses Hardhat **ethers v5** (`token.deployed()`). The UI uses **ethers v6**. That split is normal (Hardhat toolbox vs browser).

---

## Tech stack

| Layer | Choice | Why it is here |
| --- | --- | --- |
| UI | React 18 + Vite + Tailwind | Fast SPA for a hackathon demo |
| Charts | Chart.js | Dashboard / MRV trends |
| Map | Leaflet / OSM | Geo-tagged projects |
| Chain I/O | ethers.js | MetaMask |
| Contract | Solidity 0.8, OpenZeppelin 4.x | Standard token + access |
| Tooling | Hardhat | Compile / local node / deploy |
| Persistence | localStorage | No backend in the prototype |

---

## How to run the web app

```bash
npm install
npm run dev
```

Open the Vite URL. Switch **NGO / Panchayat → Verifier → NCCR Admin** and walk Register → MRV → Verification → issue → Blockchain retire.

```bash
npm run build
```

---

## How to run the contract (optional)

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat node
# other terminal:
npx hardhat run --network localhost scripts/deploy.js
```

Copy the printed address into the Blockchain screen. MetaMask: add localhost **31337**, import Hardhat account #0 (owner) to mint. Ganache is often chain id **1337**.

`mint` fails if the connected wallet is not the owner — that is expected; it is how admin-only issuance works.

---

## What is not built (say this yourself)

- No real drone/IoT feed, no satellite NDVI pipeline.
- No IPFS; files are **names only**.
- No login, KYC, or wallet-based identity for panchayats.
- No live methodology (Verra VM0007 / IPCC wetlands, etc.).
- No national database or NCCR integration.
- Registry can be cleared by wiping the browser.
- Contract does not store full MRV data.
- No automated tests.

Call it a **hackathon-grade MRV + registry + token demo**, not a carbon-market product.

---

## Interview topic map (answers, not questions)

Use this as a checklist of **themes**. Interviewers usually circle these; the paragraphs above are the content.

**Problem and SIH**  
PS id, MoES, NCCR, software + clean-tech theme, gap = trusted coastal carbon accounting in India, stakeholders = community / NGO / verifier / national admin / credit buyer.

**Science vs software**  
Blue carbon vs green (terrestrial) carbon; soil carbon; why restoration quality matters; MRV three letters; toy `area × rate` vs plot/soil/drone methodology; uncertainty, leakage, permanence (storms, cutting).

**Product flow**  
Onboarding → evidence → verify → issue → transfer (not fully built) → retire. Status values in the app: `submitted`, `mrv_submitted`, `under_review`, `verified`, `rejected`, `credits_issued`.

**Blockchain design**  
Ledger vs database; immutability; who runs a node; public vs permissioned; gas; why not put PDFs on-chain; hash + URI pattern; ERC-20 mint/burn; Ownable vs multi-sig / DAO; events for explorers; replay and chain id; MetaMask as signing UI.

**Carbon market integrity**  
Additionality (would the trees exist anyway), double counting, corresponding adjustment (Article 6 — only if they go deep), retirement vs holding, greenwashing, need for independent verifiers.

**Security and ops**  
Admin key risk (compromised owner mints infinite credits); role switch is fake auth; localStorage XSS; need for audits; oracle problem (who attests the drone photo).

**Scaling and India context**  
Coastal states, panchayat onboarding, low connectivity (offline field app then sync), language, rupee settlement vs token, integration with existing CAMPA / forest records (future, not implemented).

**Your honest contribution**  
What the screens do; that state is shared; that the contract shows mint/retire; what you would add next (auth, IPFS hashes, on-chain project ids, tests).

**Trade-offs you chose**  
One page app instead of microservices; local demo so it runs without a server; India sample sites instead of random global parks; roles as a dropdown so a single laptop can demo three actors.

---

## Glossary

- **tCO₂ / tCO₂e** — tonnes of carbon dioxide (equivalent). Credits are usually 1 token = 1 tCO₂e.
- **BCC** — BlueCarbonCredit, the ERC-20 in this repo.
- **NCCR** — National Centre for Coastal Research (MoES).
- **Proponent** — organisation that runs the restoration and applies for credits.
- **Retirement** — permanent use of a credit; supply decreases.
- **Circulating** — issued minus retired (still tradable in a real market).
- **Ganache / Hardhat Network** — local Ethereum for development.

---

## Repo layout

```
src/App.jsx                 providers
src/components/Pages.jsx    screens
src/components/Registration.jsx
src/components/VerificationWorkflow.jsx
src/components/ProjectMap.jsx
src/data/store.jsx          shared registry
src/data/seed.js            India sample projects
src/data/carbon.js          demo sequestration rates
contracts/contracts/CarbonToken.sol
contracts/scripts/deploy.js
```
