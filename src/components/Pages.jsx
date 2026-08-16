import React, { Suspense } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { ethers } from "ethers";
import { totals, useRegistry } from "../data/store";
import { estimateCredits } from "../data/carbon";
import Registration from "./Registration";
import VerificationWorkflow from "./VerificationWorkflow";

const ProjectMap = React.lazy(() => import("./ProjectMap"));

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const TOKEN_ABI = [
  "function mint(address to, uint256 amount) external",
  "function issueForProject(address to, uint256 amount, string projectId) external",
  "function retire(uint256 amount, string reason) external",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

function statusClass(status) {
  const map = {
    submitted: "bg-gray-100",
    mrv_submitted: "bg-sky-100",
    under_review: "bg-yellow-100",
    verified: "bg-emerald-100",
    rejected: "bg-red-100",
    credits_issued: "bg-violet-100",
  };
  return map[status] || "bg-gray-100";
}

const StatCard = ({ title, value, sub }) => (
  <div className="bg-white rounded p-4 shadow-sm border">
    <div className="text-xs text-gray-500">{title}</div>
    <div className="text-2xl font-semibold mt-2">{value}</div>
    {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
  </div>
);

function DashboardMain() {
  const { projects, ledger } = useRegistry();
  const t = totals(projects);
  const byEco = {};
  projects.forEach((p) => {
    byEco[p.ecosystem] = (byEco[p.ecosystem] || 0) + (p.creditsIssued || 0);
  });
  const chart = {
    labels: ["Issued", "Retired", "Circulating"],
    datasets: [{ label: "tCO₂", data: [t.issued, t.retired, t.circulating], borderColor: "#0284c7", backgroundColor: "rgba(2,132,199,0.1)", tension: 0.3 }],
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Projects in registry" value={t.count} />
        <StatCard title="Credits issued" value={`${t.issued} tCO₂`} />
        <StatCard title="Pending verification" value={t.pending} />
        <StatCard title="Retired (not resellable)" value={`${t.retired} tCO₂`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded shadow-sm border p-4">
          <h3 className="font-semibold">Credit stock (from this registry)</h3>
          <div className="mt-4 h-64"><Line data={chart} options={{ maintainAspectRatio: false }} /></div>
        </div>
        <div className="bg-white rounded shadow-sm border p-4">
          <h3 className="font-semibold">Project locations</h3>
          <div className="mt-4" style={{ height: 280 }}>
            <Suspense fallback={<div className="h-48 flex items-center justify-center text-gray-400">Loading map…</div>}>
              <ProjectMap projects={projects} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow-sm border p-4">
          <h3 className="font-semibold">Credits by ecosystem</h3>
          <ul className="mt-3 text-sm space-y-2">
            {Object.keys(byEco).length === 0 && <li className="text-gray-400">None issued yet.</li>}
            {Object.entries(byEco).map(([k, v]) => (
              <li key={k} className="flex justify-between border-b py-1"><span>{k}</span><span>{v} tCO₂</span></li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded shadow-sm border p-4">
          <h3 className="font-semibold">Recent registry events</h3>
          <ul className="mt-3 text-sm space-y-2 max-h-56 overflow-auto">
            {ledger.slice(0, 8).map((e) => (
              <li key={e.id} className="border-b py-1">
                <span className="font-medium">{e.type}</span> — {e.detail}
                <div className="text-xs text-gray-400">{e.ts}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ProjectsList({ onRegister }) {
  const { projects } = useRegistry();
  const [q, setQ] = React.useState("");
  const rows = projects.filter((p) => (p.name + p.org + p.ecosystem + p.state).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="bg-white rounded shadow-sm border p-4">
      <h2 className="text-2xl font-semibold">Project Management</h2>
      <div className="mt-4 flex items-center gap-2 mb-4">
        <input className="border p-2 rounded w-64" placeholder="Search projects..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={onRegister} className="px-3 py-2 bg-sky-600 text-white rounded">Add New Project</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-gray-500 uppercase">
          <tr>
            <th className="py-2">Project</th>
            <th>Ecosystem</th>
            <th>Location</th>
            <th>Status</th>
            <th>Issued / Retired</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="py-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-400">{p.org}</div>
              </td>
              <td>{p.ecosystem}</td>
              <td>{p.state || p.country}</td>
              <td><span className={`px-2 py-0.5 rounded text-xs ${statusClass(p.status)}`}>{p.status}</span></td>
              <td>{p.creditsIssued} / {p.creditsRetired}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MRVDashboard() {
  const { projects, addMrv, role } = useRegistry();
  const [pid, setPid] = React.useState(projects[0]?.id || "");
  const [source, setSource] = React.useState("Field app");
  const [note, setNote] = React.useState("");
  const [tco2, setTco2] = React.useState("");
  const selected = projects.find((p) => p.id === pid);
  const canUpload = role === "NGO / Panchayat" || role === "NCCR Admin";

  const labels = ["Q1", "Q2", "Q3", "Q4"];
  const data = {
    labels,
    datasets: [
      {
        label: "Reported tCO₂ (sum of MRV rows)",
        data: [1, 2, 3, 4].map((q) =>
          projects.reduce((acc, p) => acc + p.mrv.filter((_, i) => (i % 4) + 1 === q).reduce((a, m) => a + Number(m.tco2 || 0), 0), 0)
        ),
        borderColor: "#059669",
        tension: 0.3,
      },
    ],
  };

  function submitReading() {
    if (!pid) return;
    const qty = Number(tco2) || (selected ? estimateCredits(selected.areaHa, selected.ecosystem, 0.25) : 0);
    addMrv(pid, { source, note: note || "Field observation", tco2: qty, date: new Date().toISOString().slice(0, 10) });
    setNote("");
    setTco2("");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="MRV records" value={projects.reduce((a, p) => a + p.mrv.length, 0)} />
        <StatCard title="Reported tCO₂" value={projects.reduce((a, p) => a + p.mrv.reduce((x, m) => x + Number(m.tco2 || 0), 0), 0)} />
        <StatCard title="Sources in use" value="Field app, drone, sensor" sub="Prototype labels, not live IoT" />
        <StatCard title="Projects with MRV" value={projects.filter((p) => p.mrv.length).length} />
      </div>
      <div className="bg-white rounded shadow-sm border p-4">
        <h3 className="font-semibold">Add an MRV snapshot</h3>
        <p className="text-sm text-gray-500 mt-1">Stands in for mobile/drone upload. A production system would hash files and store the hash on-chain.</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <select className="border p-2 rounded" value={pid} onChange={(e) => setPid(e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="border p-2 rounded" value={source} onChange={(e) => setSource(e.target.value)}>
            <option>Field app</option>
            <option>Drone</option>
            <option>Sensor</option>
          </select>
          <input className="border p-2 rounded" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <input className="border p-2 rounded" placeholder="tCO₂ (optional)" value={tco2} onChange={(e) => setTco2(e.target.value)} />
        </div>
        <button disabled={!canUpload} onClick={submitReading} className="mt-3 px-3 py-2 bg-sky-600 text-white rounded disabled:opacity-40">Save snapshot</button>
        {!canUpload && <div className="text-xs text-gray-500 mt-2">Switch role to NGO / Panchayat or NCCR Admin to upload.</div>}
      </div>
      <div className="bg-white rounded shadow-sm border p-4">
        <h3 className="font-semibold">Sequestration reports (demo chart)</h3>
        <div className="mt-4 h-64"><Line data={data} options={{ maintainAspectRatio: false }} /></div>
      </div>
    </div>
  );
}

function WalletConnect({ onNetwork }) {
  const [address, setAddress] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const [chainId, setChainId] = React.useState(null);
  const [error, setError] = React.useState(null);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setError("No wallet detected. Install MetaMask.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      const bal = await provider.getBalance(addr);
      setBalance(ethers.formatEther(bal));
      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());
      onNetwork?.(network.chainId.toString());
      setError(null);
    } catch (e) {
      setError(e?.message || String(e));
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded border">
      <div className="text-sm text-gray-500">Wallet connection</div>
      <div className="mt-2 font-mono text-xs">{address || "Not connected"}</div>
      <div className="mt-2 text-sm">Balance: {balance ? `${Number(balance).toFixed(4)} ETH` : "-"}</div>
      <div className="mt-2 text-xs text-gray-500">Chain ID: {chainId ?? "-"}</div>
      <button onClick={connectWallet} className="mt-3 px-3 py-2 bg-sky-600 text-white rounded">Connect MetaMask</button>
      <div className="text-xs text-red-500 mt-2">{error}</div>
    </div>
  );
}

function BlockchainIntegration() {
  const { projects, ledger, retireCredits, recordChainTx, role } = useRegistry();
  const [chainId, setChainId] = React.useState(null);
  const [contractAddr, setContractAddr] = React.useState(localStorage.getItem("bluecarbon:contract") || "");
  const [pid, setPid] = React.useState(projects.find((p) => p.creditsIssued)?.id || projects[0]?.id || "");
  const [retireAmt, setRetireAmt] = React.useState("10");

  async function doMint() {
    try {
      if (!window.ethereum) { alert("No wallet found"); return; }
      if (!contractAddr) { alert("Paste the deployed contract address first."); return; }
      localStorage.setItem("bluecarbon:contract", contractAddr);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddr, TOKEN_ABI, signer);
      const amount = BigInt(10) * BigInt(10) ** BigInt(18);
      const tx = await contract.mint(await signer.getAddress(), amount);
      recordChainTx("On-chain mint 10 BCC", tx.hash);
      alert("Mint sent: " + tx.hash);
    } catch (e) {
      alert("Mint failed: " + (e?.message || e));
    }
  }

  async function doRetireOnChain() {
    try {
      if (!window.ethereum || !contractAddr) { alert("Wallet + contract address required"); return; }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddr, TOKEN_ABI, signer);
      const amount = BigInt(retireAmt) * BigInt(10) ** BigInt(18);
      const tx = await contract.retire(amount, "offset claim");
      recordChainTx("On-chain retire " + retireAmt + " BCC", tx.hash);
      alert("Retire sent: " + tx.hash);
    } catch (e) {
      alert("On-chain retire failed (owner mint / balance needed): " + (e?.message || e));
    }
  }

  return (
    <div className="bg-white rounded shadow-sm border p-4">
      <h2 className="text-2xl font-semibold">Blockchain</h2>
      <p className="text-gray-500 text-sm">Local registry events always work. On-chain mint/retire needs Hardhat/Ganache + the CarbonToken address.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <WalletConnect onNetwork={setChainId} />
        <div className="bg-gray-50 p-4 rounded border">
          <div className="text-sm text-gray-500">Expected local network</div>
          <div className="mt-2 text-sm">Hardhat 31337 or Ganache 1337. Current: {chainId ?? "not connected"}</div>
          <div className="mt-3 text-xs text-gray-500">Only the contract owner can mint. After `npx hardhat node`, account #0 is the owner.</div>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold">Smart contract (optional)</h3>
        <input value={contractAddr} onChange={(e) => setContractAddr(e.target.value)} placeholder="Deployed CarbonToken address" className="border p-2 rounded w-full max-w-xl mt-2" />
        <div className="mt-2 flex gap-2">
          <button onClick={doMint} className="px-3 py-2 bg-sky-600 text-white rounded">Mint 10 BCC on-chain</button>
          <button onClick={doRetireOnChain} className="px-3 py-2 bg-gray-800 text-white rounded">Retire on-chain</button>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold">Retire credits in the local registry</h3>
        <p className="text-xs text-gray-500">Retirement = the offset is used and must not be sold again (double-counting control).</p>
        <div className="mt-2 flex gap-2">
          <select className="border p-2 rounded" value={pid} onChange={(e) => setPid(e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.creditsIssued - p.creditsRetired} free)</option>)}
          </select>
          <input className="border p-2 rounded w-24" value={retireAmt} onChange={(e) => setRetireAmt(e.target.value)} />
          <button
            disabled={role !== "NCCR Admin"}
            onClick={() => retireCredits(pid, retireAmt)}
            className="px-3 py-2 bg-violet-600 text-white rounded disabled:opacity-40"
          >
            Retire locally
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold">Audit trail</h3>
        <table className="w-full text-sm mt-2">
          <thead className="text-xs text-gray-500 uppercase"><tr><th className="text-left py-2">Type</th><th>Detail</th><th>Time</th></tr></thead>
          <tbody>
            {ledger.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="py-2 font-medium">{e.type}</td>
                <td>{e.detail}{e.hash ? <span className="font-mono text-xs"> {e.hash}</span> : ""}</td>
                <td className="text-xs text-gray-400">{e.ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const titles = {
  Dashboard: "Dashboard",
  Register: "Register Project",
  Manage: "Manage Projects",
  MRV: "MRV",
  Verification: "Verification",
  Blockchain: "Blockchain",
};

export default function BlueCarbonApp() {
  const { role, setRole, resetDemo } = useRegistry();
  const [route, setRoute] = React.useState("Dashboard");
  const nav = [
    { title: "Dashboard", key: "Dashboard" },
    { title: "Register Project", key: "Register" },
    { title: "Manage Projects", key: "Manage" },
    { title: "MRV Dashboard", key: "MRV" },
    { title: "Verification", key: "Verification" },
    { title: "Blockchain", key: "Blockchain" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="flex">
        <div className="w-72 bg-white border-r border-gray-200 min-h-screen sticky top-0">
          <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-sky-600 to-emerald-400 flex items-center justify-center text-white font-bold">BC</div>
            <div>
              <div className="font-semibold">BlueCarbon</div>
              <div className="text-xs text-gray-500">SIH25038 registry</div>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {nav.map((n) => (
              <button key={n.key} onClick={() => setRoute(n.key)} className={`w-full flex items-center gap-3 p-3 rounded text-left ${route === n.key ? "bg-sky-50 border border-sky-100" : "hover:bg-gray-50"}`}>
                <div className={`text-sm ${route === n.key ? "text-sky-700 font-medium" : "text-gray-700"}`}>{n.title}</div>
              </button>
            ))}
          </nav>
          <div className="px-6 pb-6 text-xs text-gray-400">Prototype · browser storage</div>
        </div>
        <div className="flex-1 min-h-screen">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="text-xl font-semibold">{titles[route]}</div>
            <div className="flex items-center gap-3">
              <select className="border p-2 rounded text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>NGO / Panchayat</option>
                <option>Verifier</option>
                <option>NCCR Admin</option>
              </select>
              <button onClick={resetDemo} className="text-xs border px-2 py-1 rounded">Reset demo data</button>
            </div>
          </div>
          <div className="p-6">
            {route === "Dashboard" && <DashboardMain />}
            {route === "Register" && <Registration />}
            {route === "Manage" && <ProjectsList onRegister={() => setRoute("Register")} />}
            {route === "MRV" && <MRVDashboard />}
            {route === "Verification" && <VerificationWorkflow />}
            {route === "Blockchain" && <BlockchainIntegration />}
          </div>
        </div>
      </div>
    </div>
  );
}
