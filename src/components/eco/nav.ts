import { Home, ScanLine, Lightbulb, Boxes, BarChart3, History, MonitorSmartphone } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/scanner", label: "AI Scanner", icon: ScanLine },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/digital-twin", label: "Digital Twin", icon: Boxes },
  { to: "/impact", label: "Impact Dashboard", icon: BarChart3 },
  { to: "/history", label: "Scan History", icon: History },
  { to: "/devices", label: "Device Preview", icon: MonitorSmartphone },
] as const;
