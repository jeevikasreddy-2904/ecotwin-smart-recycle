import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import EcoTwinAccess from "@/components/eco/EcoTwinAccess";
import EcoTwinDashboard from "@/components/eco/EcoTwinDashboard";

export const Route = createFileRoute("/manager")({
  component: ManagerPage,
});

function ManagerPage() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <EcoTwinAccess>
      <div>
        <EcoTwinDashboard />
      </div>
    </EcoTwinAccess>
  );
}