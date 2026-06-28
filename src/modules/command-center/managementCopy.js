/** EP / EM 管理层指挥中心统一文案 */

export const SATURATION_LEVEL_LABEL = {
  高: "偏高",
  中: "适中",
  低: "偏低"
};

export const ROLE_PAGE_INTRO = {
  ep: "以 Engagement Partner 身份查看项目组合：各项目报告日与程序逾期情况，以及下辖 EM 概况（本人不执行现场程序）。",
  em: "以 Engagement Manager 身份查看所辖项目：报告日进度、程序逾期与现场团队工作饱和度（本人不执行现场程序）。",
  ic: "查看所辖项目上 IC / Staff 的工作饱和度与当前优先项目，并关注各项目报告日。"
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
    title: "报告日时间轴",
    body: "横轴表示从今天起距报告日的天数；色带区分 7 / 14 / 30 天预警区；圆点越大表示逾期程序越多。"
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
