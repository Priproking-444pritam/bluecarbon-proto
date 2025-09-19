import React from "react";

export default function VerificationWorkflow({ projects = null }) {
  const sample = projects ?? [
    {
      id: 1,
      title: "Mangrove Restoration Initiative - Sundarbans",
      org: "Bangladesh Forest Department",
      ecosystem: "Mangroves",
      location: "Sundarbans, Bangladesh",
      status: "under review",
      date: "2025-08-20",
    },
    {
      id: 2,
      title: "Seagrass Conservation Project - Great Barrier Reef",
      org: "Marine Conservation Australia",
      ecosystem: "Seagrass",
      location: "Queensland, Australia",
      status: "pending",
      date: "2025-08-25",
    },
    {
      id: 3,
      title: "Coastal Wetland Protection - California",
      org: "California Coastal Conservancy",
      ecosystem: "Salt Marsh",
      location: "San Francisco Bay, CA",
      status: "requires revision",
      date: "2025-08-15",
    },
  ];

  const [selectedId, setSelectedId] = React.useState(null);
  const selected = sample.find((p) => p.id === selectedId);

  return (
    <div className="p-6">
      <div className="bg-white rounded shadow-sm border p-4">
        <h2 className="text-2xl font-semibold">Verification Workflow</h2>

        <div className="mt-4 flex gap-6">
          <div className="w-1/3">
            <div className="text-sm text-gray-500">Project Queue</div>
            <div className="mt-4 space-y-3">
              {sample.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left p-3 border rounded hover:bg-gray-50 flex justify-between items-start ${selectedId === p.id ? "bg-sky-50 border-sky-200" : ""
                    }`}
                >
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-gray-400">{p.org}</div>
                    <div className="text-xs text-gray-400 mt-1">status: <span className="font-medium">{p.status}</span></div>
                  </div>
                  <div className="text-xs text-gray-400">{p.date}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 border-l pl-6">
            {!selected && <div className="text-gray-400">No Project Selected. Select a project from the queue to view details.</div>}

            {selected && (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{selected.title}</h3>
                    <div className="text-xs text-gray-500">{selected.org} • {selected.location}</div>
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">{selected.status}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded border">
                    <div className="text-xs text-gray-500">Ecosystem</div>
                    <div className="mt-1 font-medium">{selected.ecosystem}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border">
                    <div className="text-xs text-gray-500">Last Updated</div>
                    <div className="mt-1 font-medium">{selected.date}</div>
                  </div>
                </div>

                <div className="mt-6 bg-white p-4 border rounded shadow-sm">
                  <h4 className="font-semibold">Verifier Notes</h4>
                  <textarea placeholder="Add verification notes..." rows={6} className="w-full mt-2 border p-2 rounded" />
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-2 bg-sky-600 text-white rounded">Approve</button>
                    <button className="px-3 py-2 bg-yellow-100 rounded">Request Revision</button>
                    <button className="px-3 py-2 bg-red-100 rounded">Reject</button>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold">Uploaded Evidence</h4>
                  <ul className="mt-2 space-y-2">
                    <li className="p-3 border rounded bg-white">baseline_report.pdf <span className="text-xs text-gray-400 ml-2">2.3 MB</span></li>
                    <li className="p-3 border rounded bg-white">survey_photos.zip <span className="text-xs text-gray-400 ml-2">12.1 MB</span></li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
