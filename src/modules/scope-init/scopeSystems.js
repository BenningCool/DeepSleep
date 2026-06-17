export const KEY_SYSTEMS = [
  { id: "erp", label: "ERP", hint: "Financial accounting, procurement, inventory master data" },
  { id: "core-banking", label: "Core Accounting System", hint: "Deposits/loans, general ledger, payment clearing" },
  { id: "hrms", label: "HRMS / HR System", hint: "Joiner/leaver, payroll, organization structure" },
  { id: "oa", label: "OA / Approval Workflow", hint: "Expense reimbursement, contract approval, seal usage" },
  { id: "crm", label: "CRM / Sales System", hint: "Customer master data, contracts, revenue recognition" },
  { id: "scm", label: "Supply Chain / WMS", hint: "Purchase orders, goods in/out, reconciliation" },
  { id: "bi", label: "BI / Reporting Platform", hint: "Management reporting, regulatory reporting, data mart" },
  { id: "iam", label: "Unified Identity Authentication", hint: "SSO, AD/LDAP, privileged accounts" }
];

const SYSTEM_TASKS = {
  erp: {
    title: "ERP Control Walkthrough Testing",
    description: "Perform walkthrough testing and sample inspection for ERP embedded controls such as procure-to-pay and order-to-cash.",
    priority: "P0",
    status: "development",
    auditPhase: "control-test"
  },
  "core-banking": {
    title: "Core Accounting System Access and Batch Review",
    description: "Review teller access, end-of-day batch monitoring, abnormal transaction alerts, and reconciliation mechanisms.",
    priority: "P0",
    status: "development",
    auditPhase: "control-test"
  },
  hrms: {
    title: "HRMS Joiner/Leaver and Access Linkage Testing",
    description: "Validate timeliness and accuracy of downstream account provisioning/removal in joiner/leaver processes.",
    priority: "P0",
    status: "design",
    auditPhase: "control-design"
  },
  oa: {
    title: "OA Approval Flow and Delegation Matrix Testing",
    description: "Review approval hierarchy, delegation, exception approvals, and post-event monitoring.",
    priority: "P1",
    status: "design",
    auditPhase: "control-design"
  },
  crm: {
    title: "CRM Revenue Recognition Interface Reconciliation",
    description: "Validate interface consistency and exception handling among CRM contracts, orders, and revenue recognition.",
    priority: "P0",
    status: "development",
    auditPhase: "control-test"
  },
  scm: {
    title: "Supply Chain Three-way Reconciliation and Inventory Adjustment",
    description: "Review control effectiveness over purchase orders, goods receipts, invoices, and inventory book adjustments.",
    priority: "P1",
    status: "development",
    auditPhase: "control-test"
  },
  bi: {
    title: "BI Report Data Logic and Change Management",
    description: "Review report SQL/ETL logic, version change approvals, and data lineage documentation.",
    priority: "P1",
    status: "design",
    auditPhase: "control-design"
  },
  iam: {
    title: "Unified Identity Authentication and Privileged Account Governance",
    description: "Test SSO integration, MFA policy, privileged account request approval, and periodic review.",
    priority: "P0",
    status: "design",
    auditPhase: "control-design",
    scopeCritical: true
  }
};

export function getSystemTasks(systemIds = []) {
  return systemIds
    .map((id) => SYSTEM_TASKS[id])
    .filter(Boolean)
    .map((task) => ({
      ...task,
      title: task.title,
      systemScoped: true
    }));
}

export function labelOfSystem(id) {
  return KEY_SYSTEMS.find((item) => item.id === id)?.label || id;
}
