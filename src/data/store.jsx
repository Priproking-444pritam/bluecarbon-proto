import React from "react";
import { seedLedger, seedProjects } from "./seed";

export const ROLES = ["NGO / Panchayat", "Verifier", "NCCR Admin"];

const STATE_KEY = "bluecarbon:registry:v1";
const ROLE_KEY = "bluecarbon:role";

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { projects: seedProjects, ledger: seedLedger };
}

function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

const RegistryContext = React.createContext(null);

export function RegistryProvider({ children }) {
  const [state, setState] = React.useState(loadState);
  const [role, setRole] = React.useState(() => localStorage.getItem(ROLE_KEY) || "NCCR Admin");

  React.useEffect(() => saveState(state), [state]);
  React.useEffect(() => localStorage.setItem(ROLE_KEY, role), [role]);

  function patch(updater) {
    setState((prev) => updater(structuredClone(prev)));
  }

  function withEvent(s, entry) {
    s.ledger.unshift({ id: "e-" + Date.now(), ts: new Date().toISOString(), ...entry });
  }

  const api = {
    projects: state.projects,
    ledger: state.ledger,
    role,
    setRole,
    resetDemo() {
      localStorage.removeItem(STATE_KEY);
      setState({ projects: seedProjects, ledger: seedLedger });
    },
    addProject(form) {
      const project = {
        id: "p-" + Date.now(),
        name: form.name,
        org: form.org || "Onboarded NGO / Panchayat",
        description: form.description,
        country: form.country || "India",
        state: form.state || "",
        lat: Number(form.lat) || 0,
        lng: Number(form.lng) || 0,
        ecosystem: form.ecosystem,
        areaHa: Number(form.areaHa) || 0,
        status: "submitted",
        creditsIssued: 0,
        creditsRetired: 0,
        documents: form.documents || [],
        mrv: [],
        notes: "",
      };
      patch((s) => {
        s.projects.unshift(project);
        withEvent(s, { type: "REGISTER", projectId: project.id, detail: `Registered ${project.name}` });
        return s;
      });
      return project;
    },
    addMrv(projectId, reading) {
      patch((s) => {
        const p = s.projects.find((x) => x.id === projectId);
        if (!p) return s;
        p.mrv.push({ id: "m-" + Date.now(), ...reading });
        p.status = "mrv_submitted";
        withEvent(s, { type: "MRV", projectId, detail: `${reading.source}: ${reading.note}` });
        return s;
      });
    },
    setStatus(projectId, status, notes) {
      patch((s) => {
        const p = s.projects.find((x) => x.id === projectId);
        if (!p) return s;
        p.status = status;
        if (notes !== undefined) p.notes = notes;
        withEvent(s, { type: "VERIFY", projectId, detail: `Status → ${status}${notes ? ": " + notes : ""}` });
        return s;
      });
    },
    issueCredits(projectId, amount) {
      const qty = Number(amount) || 0;
      patch((s) => {
        const p = s.projects.find((x) => x.id === projectId);
        if (!p) return s;
        p.creditsIssued += qty;
        p.status = "credits_issued";
        withEvent(s, { type: "ISSUE", projectId, detail: `Issued ${qty} tCO₂ as BCC` });
        return s;
      });
    },
    retireCredits(projectId, amount) {
      const qty = Number(amount) || 0;
      patch((s) => {
        const p = s.projects.find((x) => x.id === projectId);
        if (!p) return s;
        const available = p.creditsIssued - p.creditsRetired;
        const use = Math.min(qty, available);
        p.creditsRetired += use;
        withEvent(s, { type: "RETIRE", projectId, detail: `Retired ${use} tCO₂` });
        return s;
      });
    },
    recordChainTx(detail, hash) {
      patch((s) => {
        withEvent(s, { type: "CHAIN", projectId: "", detail, hash });
        return s;
      });
    },
  };

  return <RegistryContext.Provider value={api}>{children}</RegistryContext.Provider>;
}

export function useRegistry() {
  const ctx = React.useContext(RegistryContext);
  if (!ctx) throw new Error("useRegistry must be used inside RegistryProvider");
  return ctx;
}

export function totals(projects) {
  const issued = projects.reduce((a, p) => a + (p.creditsIssued || 0), 0);
  const retired = projects.reduce((a, p) => a + (p.creditsRetired || 0), 0);
  const pending = projects.filter((p) => ["submitted", "mrv_submitted", "under_review"].includes(p.status)).length;
  return { issued, retired, pending, circulating: issued - retired, count: projects.length };
}
