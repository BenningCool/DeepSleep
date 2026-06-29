/** EP / EM 管理层指挥中心统一文案 */

export const SATURATION_LEVEL_LABEL = {
  高: "偏高",
  中: "适中",
  低: "偏低"
};

export const ROLE_PAGE_INTRO = {
  ep: "以 Engagement Partner 身份查看项目组合：各项目报告日与程序逾期情况，以及下辖 EM 概况（本人不执行现场程序）。",
  em: "以 Engagement Manager 身份查看所辖项目：报告日进度、程序逾期与现场团队工作饱和度（本人不执行现场程序）。",
  ic: "以 In-charge 身份查看所辖项目：报告日、程序逾期与组内 IC / Staff 工作饱和度。",
  staff: "跨项目个人工作全景：参与项目的报告日、程序逾期与指派测试点进度。",
  ita_lead: "查看 ITA 组有贡献的项目：报告日预警与各项目测试点进度。",
  tax_lead: "查看 Tax 组有贡献的项目：报告日预警与各项目测试点进度。"
};

export const METRICS_LEGEND = [
  {
    title: "报告日",
    body: "距离审计报告出具日（Report Date）的天数。系统对 30 / 14 / 7 天内出具报告的项目预警。"
  },
  {
    title: "逾期程序",
    body: "已超过计划完成日、尚未完成的程序（测试点）数量。"
  },
  {
    title: "关注级别",
    body: "综合报告日临近程度、逾期程序数与完成进度，分为：需立即关注、需重点关注、持续跟踪、进展正常。"
  },
  {
    title: "工作饱和度",
    body: "根据跨项目未开始 / 测试中 / 逾期程序的加权估算，分为偏高、适中、偏低。"
  },
  {
    title: "报告日日历",
    body: "按实际报告日期展示未来数月的组合安排；色块区分 7 / 14 / 30 天预警区；标记数字表示逾期程序数。"
  }
];

export function formatProcedureOverdue(count) {
  if (!count) return "无逾期程序";
  return `${count} 项程序逾期`;
}

export function formatCompletionLabel(completion) {
  if (!completion?.total) return "暂无程序";
  return `完成 ${completion.percent ?? 0}%`;
}
