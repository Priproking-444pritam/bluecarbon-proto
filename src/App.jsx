/* App.jsx - Full BlueCarbon UI with lazy-loaded ProjectMap */
import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { ethers } from "ethers";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// sample chart data
const sampleChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  datasets: [
    { label: "Mangroves", data: [2800, 3000, 3100, 3200, 3500, 3700, 3900, 4100], tension: 0.4, borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,0.05)" },
    { label: "Wetlands", data: [1200, 1300, 1350, 1400, 1500, 1600, 1700, 1800], tension: 0.4, borderColor: "#059669", backgroundColor: "rgba(5,150,105,0.05)" },
    { label: "Seagrass", data: [800, 900, 950, 1000, 1100, 1200, 1300, 1400], tension: 0.4, borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.05)" }
  ]
};

// lazy-load map component
const ProjectMap = React.lazy(() => import("./components/ProjectMap"));

// sample projects for map
const sampleProjects = [
  { id: 1, name: "Sundarbans Mangrove", lat: 21.9497, lng: 89.1833, ecosystem: "Mangroves" },
  { id: 2, name: "Florida Everglades", lat: 25.2866, lng: -80.8987, ecosystem: "Wetlands" },
  { id: 3, name: "Great Barrier Reef", lat: -18.2871, lng: 147.6992, ecosystem: "Seagrass" }
];

// WalletConnect
function WalletConnect() {
  const [address, setAddress] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const [chainId, setChainId] = React.useState(null);
  const [error, setError] = React.useState(null);

  async function connectWallet() {
    try {
      if (!window.ethereum) { setError("No wallet detected. Install MetaMask."); return; }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      const bal = await provider.getBalance(addr);
      setBalance(ethers.formatEther(bal));
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      setError(null);
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="bg-gray-50 p-4 rounded border">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Wallet Connection</div>
          <div className="mt-2">{address ? <div className="font-mono text-xs">{address}</div> : <div className="text-sm text-gray-600">Not connected</div>}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Balance</div>
          <div className="font-medium">{balance ? `${Number(balance).toFixed(4)} ETH` : "-"}</div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={connectWallet} className="px-3 py-2 bg-sky-600 text-white rounded">Connect MetaMask</button>
        <div className="text-xs text-red-500">{error}</div>
      </div>
      <div className="mt-2 text-xs text-gray-500">Chain ID: {chainId ?? "-"}</div>
    </div>
  );
}

// MultiStepRegistration (compact)
function MultiStepRegistration() {
  const LS_KEY = "bluecarbon:registration:draft";
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : { name: "", description: "", country:"", lat:"", long:"", ecosystem:"Mangroves", documents: [] };
    } catch {
      return { name:"", description:"", country:"", lat:"", long:"", ecosystem:"Mangroves", documents: [] };
    }
  });
  React.useEffect(()=>{ localStorage.setItem(LS_KEY, JSON.stringify(form)) }, [form]);
  function updateField(k, v){ setForm(prev => ({...prev, [k]: v})); }
  function next(){ if(step<4) setStep(s=>s+1); }
  function prev(){ if(step>1) setStep(s=>s-1); }
  function submit(){ localStorage.removeItem(LS_KEY); alert("Project submitted (prototype)."); setForm({ name:"", description:"", country:"", lat:"", long:"", ecosystem:"Mangroves", documents: []}); setStep(1); }
  return (
    <div className="bg-white rounded shadow-sm border p-6">
      <h2 className="text-2xl font-semibold"
