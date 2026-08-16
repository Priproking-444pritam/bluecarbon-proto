import React from "react";
import { estimateCredits } from "../data/carbon";
import { useRegistry } from "../data/store";

const LS_KEY = "bluecarbon:registration:draft";

const empty = {
  name: "",
  org: "",
  description: "",
  country: "India",
  state: "",
  lat: "",
  lng: "",
  ecosystem: "Mangroves",
  areaHa: "",
  documents: [],
};

export default function MultiStepRegistration() {
  const { addProject } = useRegistry();
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : { ...empty };
    } catch {
      return { ...empty };
    }
  });
  const [done, setDone] = React.useState("");

  React.useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(form));
  }, [form]);

  function updateField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function submit() {
    if (!form.name.trim()) {
      alert("Project name is required.");
      return;
    }
    const p = addProject(form);
    localStorage.removeItem(LS_KEY);
    setForm({ ...empty });
    setStep(1);
    setDone(p.name);
  }

  const estimate = estimateCredits(form.areaHa, form.ecosystem, 1);

  return (
    <div className="bg-white rounded shadow-sm border p-6">
      <h2 className="text-2xl font-semibold">Project Registration</h2>
      <p className="text-sm text-gray-500 mt-1">
        Onboard an NGO / coastal panchayat restoration site. Draft is saved in the browser until you submit.
      </p>
      <div className="text-xs text-gray-500 mt-1">Step {step} of 4</div>
      {done && <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded">Submitted: {done}. It now appears under Manage Projects.</div>}

      {step === 1 && (
        <div className="mt-4 space-y-3">
          <label className="text-sm">Project Name</label>
          <input value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full border p-2 rounded" />
          <label className="text-sm">Proponent (NGO / Panchayat)</label>
          <input value={form.org} onChange={(e) => updateField("org", e.target.value)} className="w-full border p-2 rounded" />
          <label className="text-sm">Description</label>
          <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} className="w-full border p-2 rounded" rows={4} />
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 space-y-3">
          <label className="text-sm">Country</label>
          <input value={form.country} onChange={(e) => updateField("country", e.target.value)} className="w-full border p-2 rounded" />
          <label className="text-sm">State / UT</label>
          <input value={form.state} onChange={(e) => updateField("state", e.target.value)} className="w-full border p-2 rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Latitude</label>
              <input value={form.lat} onChange={(e) => updateField("lat", e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm">Longitude</label>
              <input value={form.lng} onChange={(e) => updateField("lng", e.target.value)} className="w-full border p-2 rounded" />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 space-y-3">
          <label className="text-sm">Ecosystem Type</label>
          <select value={form.ecosystem} onChange={(e) => updateField("ecosystem", e.target.value)} className="w-full border p-2 rounded">
            <option>Mangroves</option>
            <option>Seagrass</option>
            <option>Salt Marsh</option>
            <option>Wetlands</option>
            <option>Mixed</option>
          </select>
          <label className="text-sm">Area (hectares)</label>
          <input value={form.areaHa} onChange={(e) => updateField("areaHa", e.target.value)} className="w-full border p-2 rounded" type="number" min="0" />
          <div className="text-xs text-gray-600 bg-gray-50 border p-2 rounded">
            Prototype estimate: ~{estimate} tCO₂ / year using a simple area × rate factor. Real MRV uses field plots, biomass, soil carbon, and approved methodology.
          </div>
          <label className="text-sm">Upload Documents (names only in this prototype)</label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) updateField("documents", [...(form.documents || []), { name: file.name }]);
            }}
            className="w-full"
          />
          <ul className="text-sm">{(form.documents || []).map((d, i) => <li key={i}>{d.name}</li>)}</ul>
        </div>
      )}

      {step === 4 && (
        <div className="mt-4">
          <h3 className="font-semibold">Review</h3>
          <pre className="text-xs mt-2 bg-gray-50 p-3 rounded overflow-auto">{JSON.stringify(form, null, 2)}</pre>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="px-3 py-2 bg-gray-100 rounded" disabled={step === 1}>Previous</button>
        <div className="flex gap-2">
          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} className="px-3 py-2 bg-sky-600 text-white rounded">Next</button>
          ) : (
            <button onClick={submit} className="px-3 py-2 bg-green-600 text-white rounded">Submit to registry</button>
          )}
          <button
            onClick={() => {
              localStorage.removeItem(LS_KEY);
              setForm({ ...empty });
              setDone("");
            }}
            className="px-3 py-2 bg-red-100 rounded"
          >
            Clear Draft
          </button>
        </div>
      </div>
    </div>
  );
}
