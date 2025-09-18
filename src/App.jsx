/* Full BlueCarbon prototype App.jsx
   - Sidebar, Topbar
   - Dashboard and MRV pages with Chart.js
   - Multi-step Project Registration (autosave localStorage)
   - Wallet connect (ethers.js) and Mint button
   Paste this entire file into src/App.jsx and commit.
*/

import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { ethers } from 'ethers'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

// Simple Chart data for Carbon Sequestration Trends
const sampleChartData = {
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
  datasets: [
    { label: 'Mangroves', data: [2800,3000,3100,3200,3500,3700,3900,4100], tension: 0.4, borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.05)' },
    { label: 'Wetlands', data: [1200,1300,1350,1400,1500,1600,1700,1800], tension: 0.4, borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.05)' },
    { label: 'Seagrass', data: [800,900,950,1000,1100,1200,1300,1400], tension: 0.4, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)' }
  ],
}

// MetaMask connection component (simple)
function WalletConnect(){
  const [address, setAddress] = React.useState(null)
  const [balance, setBalance] = React.useState(null)
  const [chainId, setChainId] = React.useState(null)
  const [error, setError] = React.useState(null)

  async function connectWallet(){
    try{
      if(!window.ethereum) { setError('No wallet detected. Install MetaMask.'); return; }
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      setAddress(addr)
      const bal = await provider.getBalance(addr)
      setBalance(ethers.formatEther(bal))
      const network = await provider.getNetwork()
      setChainId(network.chainId)
      setError(null)
    }catch(e){
      setError(e.message)
    }
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
          <div className="font-medium">{balance ? `${Number(balance).toFixed(4)} ETH` : '-'}</div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={connectWallet} className="px-3 py-2 bg-sky-600 text-white rounded">Connect MetaMask</button>
        <div className="text-xs text-red-500">{error}</div>
      </div>
      <div className="mt-2 text-xs text-gray-500">Chain ID: {chainId ?? '-'}</div>
    </div>
  )
}

// Multi-step registration form with localStorage autosave
function MultiStepRegistration(){
  const LS_KEY = 'bluecarbon:registration:draft'
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState(() => {
    try{
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : { name: '', description: '', country:'', lat:'', long:'', ecosystem:'Mangroves', documents: [] }
    }catch(e){ return { name:'', description:'', country:'', lat:'', long:'', ecosystem:'Mangroves', documents: [] } }
  })

  React.useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(form))
  }, [form])

  function updateField(k,v){ setForm(prev => ({...prev, [k]: v})) }

  function next(){ if(step<4) setStep(s=>s+1) }
  function prev(){ if(step>1) setStep(s=>s-1) }
  function submit(){
    // For prototype just clear draft and show alert
    localStorage.removeItem(LS_KEY)
    alert('Project submitted (prototype). Draft cleared.')
    setForm({ name:'', description:'', country:'', lat:'', long:'', ecosystem:'Mangroves', documents: []})
    setStep(1)
  }

  return (
    <div className="bg-white rounded shadow-sm border p-6">
      <h2 className="text-2xl font-semibold">Project Registration (Multi-step)</h2>
      <div className="text-xs text-gray-500 mt-1">Step {step} of 4</div>

      {step===1 && (
        <div className="mt-4 space-y-3">
          <label className="text-sm">Project Name</label>
          <input value={form.name} onChange={e=>updateField('name', e.target.value)} className="w-full border p-2 rounded" />
          <label className="text-sm">Description</label>
          <textarea value={form.description} onChange={e=>updateField('description', e.target.value)} className="w-full border p-2 rounded" rows={4} />
        </div>
      )}

      {step===2 && (
        <div className="mt-4 space-y-3">
          <label className="text-sm">Country</label>
          <input value={form.country} onChange={e=>updateField('country', e.target.value)} className="w-full border p-2 rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Latitude</label>
              <input value={form.lat} onChange={e=>updateField('lat', e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm">Longitude</label>
              <input value={form.long} onChange={e=>updateField('long', e.target.value)} className="w-full border p-2 rounded" />
            </div>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="mt-4 space-y-3">
          <label className="text-sm">Ecosystem Type</label>
          <select value={form.ecosystem} onChange={e=>updateField('ecosystem', e.target.value)} className="w-full border p-2 rounded">
            <option>Mangroves</option>
            <option>Wetlands</option>
            <option>Seagrass</option>
            <option>Mixed</option>
          </select>

          <label className="text-sm">Upload Documents (prototype)</label>
          <input type="file" onChange={e=>{
            const file = e.target.files?.[0]
            if(file){
              const reader = new FileReader()
              reader.onload = ()=> {
                const arr = form.documents ? [...form.documents] : []
                arr.push({name: file.name})
                updateField('documents', arr)
              }
              reader.readAsArrayBuffer(file)
            }
          }} className="w-full" />
          <div className="text-xs text-gray-600">Files will be stored in browser draft (names only) in this prototype.</div>
          <ul className="mt-2 text-sm">
            {form.documents && form.documents.map((d,i)=> <li key={i}>{d.name}</li>)}
          </ul>
        </div>
      )}

      {step===4 && (
        <div className="mt-4">
          <h3 className="font-semibold">Review</h3>
          <pre className="text-xs mt-2 bg-gray-50 p-3 rounded">{JSON.stringify(form, null, 2)}</pre>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <div>
          <button onClick={prev} className="px-3 py-2 bg-gray-100 rounded" disabled={step===1}>Previous</button>
        </div>
        <div className="flex gap-2">
          {step<4 ? <button onClick={next} className="px-3 py-2 bg-sky-600 text-white rounded">Next</button> : <button onClick={submit} className="px-3 py-2 bg-green-600 text-white rounded">Submit</button>}
          <button onClick={()=>{
            localStorage.removeItem(LS_KEY)
            setForm({ name:'', description:'', country:'', lat:'', long:'', ecosystem:'Mangroves', documents: []})
          }} className="px-3 py-2 bg-red-100 rounded">Clear Draft</button>
        </div>
      </div>
    </div>
  )
}

const Sidebar = ({active = 'Dashboard'}) => {
  const nav = [
    {title: 'Dashboard', key: 'Dashboard'},
    {title: 'Register Project', key: 'Register'},
    {title: 'Manage Projects', key: 'Manage'},
    {title: 'MRV Dashboard', key: 'MRV'},
    {title: 'Verification', key: 'Verification'},
    {title: 'Infrastructure', key: 'Infra'}
  ]
  return (
    <div className="w-72 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-sky-600 to-emerald-400 flex items-center justify-center text-white font-bold">BC</div>
        <div>
          <div className="font-semibold">BlueCarbon</div>
          <div className="text-xs text-gray-500">Registry</div>
        </div>
      </div>
      <nav className="p-4">
        {nav.map(n => (
          <div key={n.key} className={`flex items-center gap-3 p-3 rounded ${active===n.key? 'bg-sky-50 border border-sky-100': 'hover:bg-gray-50'} cursor-pointer`}> 
            <div className="w-7 h-7 rounded bg-white border flex items-center justify-center text-sky-600">{n.title[0]}</div>
            <div className={`text-sm ${active===n.key? 'text-sky-700 font-medium' : 'text-gray-700'}`}>{n.title}</div>
          </div>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="text-xs text-gray-400">Admin User</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white">A</div>
          <div className="text-sm">Admin</div>
        </div>
      </div>
    </div>
  )
}

const OpenPreviewHint = () => {
  const inIframe = typeof window !== 'undefined' && window.self !== window.top
  if(!inIframe) return null
  return (
    <div className="p-2 bg-yellow-50 border rounded text-sm text-yellow-800">
      MetaMask may not work inside the embedded preview. <a target="_blank" rel="noreferrer" href={window.location.href} className="underline">Open preview in a new tab</a>.
    </div>
  )
}

// Mint helper used by the inline UI button
async function MintCredits_doMint(addr){
  try{
    if(!window.ethereum) { alert('No wallet found'); return; }
    if(!addr){ alert('No contract address provided'); return; }
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const abi = ["function mint(address to, uint256 amount) external"]
    const contract = new ethers.Contract(addr, abi, signer)
    const decimals = 18
    const amount = BigInt(10) * BigInt(10)**BigInt(decimals)
    const tx = await contract.mint(await signer.getAddress(), amount)
    alert('Mint tx sent. Tx hash: ' + (tx.hash || tx.transactionHash || 'sent'))
  }catch(e){
    alert('Mint failed: ' + (e?.message || e))
  }
}

const Topbar = ({connected=true}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="text-xl font-semibold">{connected? 'Dashboard' : 'Disconnected'}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected? 'bg-emerald-500':'bg-red-500'}`}></div>
          <div className="text-sm">Admin User</div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({title, value, sub}) => (
  <div className="bg-white rounded p-4 shadow-sm border">
    <div className="text-xs text-gray-500">{title}</div>
    <div className="text-2xl font-semibold mt-2">{value}</div>
    {sub && <div className="text-xs text-green-600 mt-1">{sub}</div>}
  </div>
)

const DashboardMain = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Projects" value="47" sub="+12% from last month" />
      <StatCard title="Carbon Credits Issued" value="125,420 tCO₂" sub="+8.5% from last month" />
      <StatCard title="Pending Verifications" value="8" sub="-15% from last week" />
      <StatCard title="Blockchain Transactions" value="234" sub="+23% from last month" />
    </div>

    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white rounded shadow-sm border p-4">
        <h3 className="font-semibold">Carbon Sequestration Trends</h3>
        <div className="mt-4"><Line data={sampleChartData} /></div>
      </div>
      <div className="bg-white rounded shadow-sm border p-4">
        <h3 className="font-semibold">Project Locations</h3>
        <div className="mt-4 h-48 bg-gray-50 rounded flex items-center justify-center text-gray-300">Map</div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded shadow-sm border p-4">
        <h3 className="font-semibold">Ecosystem Health Metrics</h3>
        <div className="mt-4">Metric cards here</div>
      </div>
      <div className="bg-white rounded shadow-sm border p-4">
        <h3 className="font-semibold">Recent Activity</h3>
        <div className="mt-4">Logs and uploads</div>
      </div>
    </div>
  </div>
)

const MRVDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Carbon Sequestered" value="2,847 tCO₂" sub="+12.5% vs last month" />
      <StatCard title="Active Data Sources" value="156 sensors" sub="+8 vs last month" />
      <StatCard title="Verification Progress" value="78%" sub="+5.2% vs last month" />
      <StatCard title="Data Quality Score" value="94.2 /100" sub="-1.1% vs last month" />
    </div>

    <div className="bg-white rounded shadow-sm border p-4">
      <h3 className="font-semibold">Sequestration Trends</h3>
      <div className="mt-4"><Line data={sampleChartData} /></div>
    </div>
  </div>
)

const ProjectRegistration = () => (
  <div className="p-6">
    <MultiStepRegistration />
  </div>
)

const ProjectsList = () => (
  <div className="p-6">
    <div className="bg-white rounded shadow-sm border p-4">
      <h2 className="text-2xl font-semibold">Project Management</h2>
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <input className="border p-2 rounded w-64" placeholder="Search projects..." />
          <button className="px-3 py-2 bg-sky-600 text-white rounded">Add New Project</button>
        </div>
        <table className="w-full text-left">
          <thead className="text-xs text-gray-500 uppercase">
            <tr><th className="py-2">Project Name</th><th> Ecosystem</th><th>Location</th></tr>
          </thead>
          <tbody>
            {['Mangrove Restoration Project','Pacific Wetland Restoration','Wetland Conservation Initiative','Mangrove Conservation Thailand'].map((p,i)=> (
              <tr key={i} className="border-t"><td className="py-3">{p}</td><td>Wetlands</td><td>Florida Keys, USA</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

const VerificationWorkflow = () => (
  <div className="p-6">
    <div className="bg-white rounded shadow-sm border p-4">
      <h2 className="text-2xl font-semibold">Verification Workflow</h2>
      <div className="mt-4 flex gap-6">
        <div className="w-1/3">
          <div className="text-sm text-gray-500">Project Queue</div>
          <div className="mt-4 space-y-3">
            {['Mangrove Restoration Initiative - Sundarbans','Seagrass Conservation Project - Great Barrier Reef','Coastal Wetland Protection - California'].map((p,i)=> (
              <div key={i} className="p-3 border rounded hover:bg-gray-50">{p} <div className="text-xs text-gray-400">status: pending</div></div>
            ))}
          </div>
        </div>
        <div className="flex-1 border-l pl-6 text-gray-400">No Project Selected. Select a project from the queue to view details.</div>
      </div>
    </div>
  </div>
)

const BlockchainIntegration = () => (
  <div className="p-6">
    <div className="bg-white rounded shadow-sm border p-4">
      <h2 className="text-2xl font-semibold">Blockchain Integration</h2>
      <p className="text-gray-500">Manage Web3 connectivity, smart contracts, and tokenization processes</p>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <WalletConnect />
        <div className="bg-gray-50 p-4 rounded border">
          <div className="text-sm text-gray-500">Network</div>
          <div className="mt-2">Polygon Testnet — Chain ID 80001</div>
          <div className="mt-4">
            <button className="px-3 py-2 bg-red-600 text-white rounded">Disconnect</button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Smart Contracts</h3>
        <div className="mt-2 text-sm text-gray-500">Use the CarbonToken contract to mint test credits. Deploy the contract from the /contracts folder then paste the contract address below.</div>
        <div className="mt-2"><input id="contractAddrMain" placeholder="Paste deployed contract address here" className="border p-2 rounded w-80" /></div>
        <div className="mt-2"><button onClick={()=>{ const addr = document.getElementById('contractAddrMain').value.trim(); MintCredits_doMint(addr); }} className="px-3 py-2 bg-sky-600 text-white rounded">Mint 10 BCC</button></div>
      </div>
    </div>
  </div>
)

export default function BlueCarbonApp(){
  const [route, setRoute] = React.useState('Dashboard')
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="flex">
        <Sidebar active={route} />
        <div className="flex-1 min-h-screen">
          <Topbar connected={true} />
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <button onClick={()=>setRoute('Dashboard')} className={`px-3 py-2 rounded ${route==='Dashboard'? 'bg-sky-600 text-white' : 'bg-white border'}`}>Dashboard</button>
                <button onClick={()=>setRoute('Register')} className={`px-3 py-2 rounded ${route==='Register'? 'bg-sky-600 text-white' : 'bg-white border'}`}>Register Project</button>
                <button onClick={()=>setRoute('Manage')} className={`px-3 py-2 rounded ${route==='Manage'? 'bg-sky-600 text-white' : 'bg-white border'}`}>Projects</button>
                <button onClick={()=>setRoute('MRV')} className={`px-3 py-2 rounded ${route==='MRV'? 'bg-sky-600 text-white' : 'bg-white border'}`}>MRV</button>
                <button onClick={()=>setRoute('Verification')} className={`px-3 py-2 rounded ${route==='Verification'? 'bg-sky-600 text-white' : 'bg-white border'}`}>Verification</button>
                <button onClick={()=>setRoute('Blockchain')} className={`px-3 py-2 rounded ${route==='Blockchain'? 'bg-sky-600 text-white' : 'bg-white border'}`}>Blockchain</button>
              </div>
            </div>

            <div className="bg-transparent min-h-[60vh] rounded">
              {route==='Dashboard' && <DashboardMain />}
              {route==='Register' && <ProjectRegistration />}
              {route==='Manage' && <ProjectsList />}
              {route==='MRV' && <MRVDashboard />}
              {route==='Verification' && <VerificationWorkflow />}
              {route==='Blockchain' && <BlockchainIntegration />}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
