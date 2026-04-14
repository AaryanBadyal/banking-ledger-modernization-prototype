import { CreditCard, Shield, Bell, User, Wallet } from "lucide-react";

export interface ModuleInfo {
  id: string;
  name: string;
  icon: typeof CreditCard;
  color: string;
  description: string;
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  connections: string[];
  whyIsolate: string;
}

export const modules: ModuleInfo[] = [
  {
    id: "accounts",
    name: "Accounts",
    icon: Wallet,
    color: "199 89% 48%",
    description: "Manages user account data, balances, and account lifecycle status.",
    responsibilities: ["Store account balances", "User account details", "Account status management", "Balance updates"],
    inputs: ["Balance adjustment requests", "Account queries", "Status change requests"],
    outputs: ["Current balance", "Account status", "Transaction history"],
    connections: ["Payments", "Customer Profile"],
    whyIsolate: "Account data is the most sensitive part of a banking system. Isolating it means balance logic can be audited, tested, and updated independently without risking payment or notification flows.",
  },
  {
    id: "payments",
    name: "Payments",
    icon: CreditCard,
    color: "165 70% 46%",
    description: "Processes money transfers and handles all payment-related business logic.",
    responsibilities: ["Transfer money between accounts", "Process transactions", "Handle payment logic", "Manage payment queues"],
    inputs: ["Transfer requests", "Payment details", "Fraud approval status"],
    outputs: ["Transaction results", "Balance update requests", "Notification triggers"],
    connections: ["Accounts", "Fraud Detection", "Notifications"],
    whyIsolate: "Payment logic changes frequently with new regulations and methods. Isolating it allows rapid iteration on payment flows without touching account balances or notification systems.",
  },
  {
    id: "fraud",
    name: "Fraud Detection",
    icon: Shield,
    color: "38 92% 50%",
    description: "Analyzes transactions for suspicious patterns and decides whether to approve or block them.",
    responsibilities: ["Risk assessment", "Flag suspicious activity", "Approve or block risky payments", "Pattern analysis"],
    inputs: ["Transaction details", "User behavior data", "Historical patterns"],
    outputs: ["Risk score", "Approval/denial decision", "Alert triggers"],
    connections: ["Payments", "Notifications"],
    whyIsolate: "Fraud models evolve constantly. An isolated fraud module lets data scientists update ML models and rules without any risk to the core payment or account infrastructure.",
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: Bell,
    color: "280 70% 60%",
    description: "Sends alerts, confirmations, and warnings to users across multiple channels.",
    responsibilities: ["Send transfer confirmations", "Alert on suspicious activity", "System status updates", "Multi-channel delivery"],
    inputs: ["Event triggers", "Message templates", "User preferences"],
    outputs: ["Push notifications", "Emails", "SMS alerts"],
    connections: ["Payments", "Fraud Detection", "Accounts"],
    whyIsolate: "Notification channels and templates change often. Isolating this module means you can add new channels (WhatsApp, in-app) or update templates without touching any business logic.",
  },
  {
    id: "profile",
    name: "Customer Profile",
    icon: User,
    color: "330 65% 55%",
    description: "Manages customer identity, authentication, and KYC compliance data.",
    responsibilities: ["Authentication", "Customer information", "KYC verification", "Identity management"],
    inputs: ["Login credentials", "Identity documents", "Profile updates"],
    outputs: ["Auth tokens", "Verified identity", "Customer data"],
    connections: ["Accounts"],
    whyIsolate: "Identity and KYC requirements vary by region and change with regulations. Isolating this module allows compliance teams to update verification flows independently.",
  },
];
