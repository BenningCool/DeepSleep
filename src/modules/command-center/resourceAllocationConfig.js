/** 资源分配 UI 阈值（可按角色扩展） */
export const RESOURCE_UI_DEFAULTS = {
  ep: {
    projectsPageSize: 5,
    peoplePageSize: 8,
    executorsVisible: 3,
    projectsVisible: 3,
    collapseEmBlocks: true,
    defaultExpandedEmIndex: 0
  },
  em: {
    projectsPageSize: 8,
    peoplePageSize: 10,
    executorsVisible: 3,
    projectsVisible: 3,
    singleGroup: true,
    groupTitle: "所辖 IC / Staff · 人力分配"
  },
  ic: {
    projectsPageSize: 10,
    peoplePageSize: 12,
    executorsVisible: 4,
    projectsVisible: 3,
    singleGroup: true,
    groupTitle: "组内 IC / Staff · 人力分配"
  },
  staff: {
    projectsPageSize: 12,
    peoplePageSize: 12,
    executorsVisible: 3,
    projectsVisible: 3,
    singleGroup: true,
    personal: true,
    groupTitle: "参与项目 · 我的指派"
  },
  contributor: {
    projectsPageSize: 8,
    peoplePageSize: 8,
    executorsVisible: 3,
    projectsVisible: 3,
    singleGroup: true,
    groupTitle: "协作项目 · 人力分配"
  }
};

export function resolveResourceUiConfig(mode) {
  return RESOURCE_UI_DEFAULTS[mode] || RESOURCE_UI_DEFAULTS.em;
}
