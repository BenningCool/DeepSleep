export const KEY_SYSTEMS = [
  { id: "erp", label: "ERP", hint: "财务核算、采购、库存主数据" },
  { id: "core-banking", label: "核心账务系统", hint: "存贷款、总账、支付清算" },
  { id: "hrms", label: "HRMS / 人事系统", hint: "入离职、薪酬、组织架构" },
  { id: "oa", label: "OA / 审批流", hint: "费用报销、合同审批、用章" },
  { id: "crm", label: "CRM / 销售系统", hint: "客户主数据、合同、收入确认" },
  { id: "scm", label: "供应链 / WMS", hint: "采购订单、入库出库、对账" },
  { id: "bi", label: "BI / 报表平台", hint: "管理报表、监管报送、数据集市" },
  { id: "iam", label: "统一身份认证", hint: "SSO、AD/LDAP、特权账号" }
];

const SYSTEM_TASKS = {
  erp: {
    title: "ERP 控制点穿行测试",
    description: "对采购到付款、销售到收款等 ERP 内置控制执行穿行测试与样本抽查。",
    priority: "P0",
    status: "development",
    auditPhase: "control-test"
  },
  "core-banking": {
    title: "核心账务系统权限与批处理复核",
    description: "复核柜员权限、日终批处理监控、异常交易预警与对账机制。",
    priority: "P0",
    status: "development",
    auditPhase: "control-test"
  },
  hrms: {
    title: "HRMS 入离职与权限联动测试",
    description: "验证入离职流程与下游系统账号开通/回收的及时性与准确性。",
    priority: "P0",
    status: "design",
    auditPhase: "control-design"
  },
  oa: {
    title: "OA 审批流与授权矩阵测试",
    description: "检查审批层级、代理授权、异常审批与事后监控机制。",
    priority: "P1",
    status: "design",
    auditPhase: "control-design"
  },
  crm: {
    title: "CRM 收入确认接口勾稽",
    description: "验证 CRM 合同、订单与财务收入确认的接口一致性与异常处理。",
    priority: "P0",
    status: "development",
    auditPhase: "control-test"
  },
  scm: {
    title: "供应链三方对账与库存调节",
    description: "检查采购订单、入库单、发票与库存账面调节的控制有效性。",
    priority: "P1",
    status: "development",
    auditPhase: "control-test"
  },
  bi: {
    title: "BI 报表取数逻辑与变更管理",
    description: "审阅报表 SQL/ETL 逻辑、版本变更审批与数据血缘文档。",
    priority: "P1",
    status: "design",
    auditPhase: "control-design"
  },
  iam: {
    title: "统一身份认证与特权账号治理",
    description: "测试 SSO 集成、MFA 策略、特权账号申请审批与定期复核。",
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
