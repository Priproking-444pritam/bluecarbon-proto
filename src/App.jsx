import React from "react";
import { RegistryProvider } from "./data/store";
import BlueCarbonApp from "./components/Pages";

export default function App() {
  return (
    <RegistryProvider>
      <BlueCarbonApp />
    </RegistryProvider>
  );
}
