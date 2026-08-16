import React from "react";
import { useRegistry } from "../data/store";

const badge = {
  submitted: "bg-gray-100 text-gray-700",
  mrv_submitted: "bg-sky-100 text-sky-800",
  under_review: "bg-yellow-100 text-yellow-800",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  credits_issued: "bg-violet-100 text-violet-800",
};

export default function VerificationWorkflow() {
  const { projects, role, setStatus, issueCredits } = useRegistry();
  const queue = projects.filter((p) => ["submitted", "mrv_submitted", "under_review", "verified", "rejected", "credits_issued"].includes(p.status));
  const [selectedId, setSelectedId] = React.useState(queue[0]?.id || null);
  const [notes, setNotes] = React.useState("");
  const selected = projects.find((p) => p.id === selectedId);
  const canAct = role === "Verifier" || role === "NCCR Admin";

  React.useEffect(() => {
    if (selected) setNotes(selected.notes || "");
  }, [selectedId]);

  return (
    <div className="bg-white rounded shadow-sm border p-4">
      <h2 className="text-2xl font-semibold">Verification Workflow</h2>
      <p className="text-sm text-gray-500 mt-1">Independent check of plantation / restoration evidence before credits are issued. Switch role to Verifier to act as the checker.</p>

      <div className="mt-4 flex gap-6">
        <div className="w-1/3">
          <div className="text-sm text-gray-500">Project Queue</div>
          <div className="mt-4 space-y-3">
            {queue.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left p-3 border rounded hover:bg-gray-50 ${selectedId === p.id ? "bg-sky-50 border-sky-200" : ""}`}
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-400">{p.org}</div>
                <div className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${badge[p.status] || "bg-gray-100"}`}>{p.status}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 border-l pl-6">
          {!selected && <div className="text-gray-400">Select a project from the queue.</div>}
          {selected && (
            <div>
              <h3 className="text-xl font-semibold">{selected.name}</h3>
              <div className="text-xs text-gray-500">{selected.org} · {selected.state || selected.country}</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded border"><div className="text-xs text-gray-500">Ecosystem</div><div className="font-medium">{selected.ecosystem}</div></div>
                <div className="bg-gray-50 p-4 rounded border"><div className="text-xs text-gray-500">Area</div><div className="font-medium">{selected.areaHa} ha</div></div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">MRV evidence</h4>
                <ul className="mt-2 space-y-2">
                  {selected.mrv.length === 0 && <li className="text-sm text-gray-400">No MRV uploads yet.</li>}
                  {selected.mrv.map((m) => (
                    <li key={m.id} className="p-3 border rounded text-sm">{m.date} · {m.source} · {m.note} · {m.tco2} tCO₂</li>
                  ))}
                </ul>
                <h4 className="font-semibold mt-4">Documents</h4>
                <ul className="mt-2 text-sm">{(selected.documents || []).map((d, i) => <li key={i} className="p-2 border rounded">{d.name}</li>)}</ul>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Verifier notes</h4>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full mt-2 border p-2 rounded" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button disabled={!canAct} onClick={() => setStatus(selected.id, "under_review", notes)} className="px-3 py-2 bg-gray-100 rounded disabled:opacity-40">Mark under review</button>
                  <button disabled={!canAct} onClick={() => setStatus(selected.id, "verified", notes)} className="px-3 py-2 bg-sky-600 text-white rounded disabled:opacity-40">Approve</button>
                  <button disabled={!canAct} onClick={() => setStatus(selected.id, "rejected", notes)} className="px-3 py-2 bg-red-100 rounded disabled:opacity-40">Reject</button>
                  <button
                    disabled={role !== "NCCR Admin" || selected.status === "rejected"}
                    onClick={() => {
                      const fromMrv = selected.mrv.reduce((a, m) => a + Number(m.tco2 || 0), 0);
                      const qty = fromMrv || Number(prompt("tCO₂ to issue", "100")) || 0;
                      if (qty) issueCredits(selected.id, qty);
                    }}
                    className="px-3 py-2 bg-violet-600 text-white rounded disabled:opacity-40"
                  >
                    Issue credits
                  </button>
                </div>
                {!canAct && <div className="text-xs text-gray-500 mt-2">Switch role to Verifier or NCCR Admin to change status.</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
