import { PROJECT_TYPES, TEAMS } from "../../data/projectConstants";
import { PROJECT_SORT_OPTIONS } from "../project/specialistConstants";

export function PortfolioListToolbar({
  search = "",
  teamFilter = "",
  typeFilter = "",
  sortBy = "recent",
  onSearchChange,
  onTeamFilterChange,
  onTypeFilterChange,
  onSortChange,
  searchLabel = "搜索项目",
  searchPlaceholder = "客户、项目名、行业、成员邮箱、Specialist...",
  visibleCount = 0,
  totalCount = 0
}) {
  return (
    <div className="list-toolbar command-portfolio-list-toolbar">
      <label className="search-field">
        <span className="label">{searchLabel}</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </label>
      <label className="sort-field">
        <span className="label">牵头团队</span>
        <select value={teamFilter} onChange={(e) => onTeamFilterChange(e.target.value)}>
          <option value="">全部</option>
          {TEAMS.map((team) => (
            <option key={team.id} value={team.id}>{team.label}</option>
          ))}
        </select>
      </label>
      <label className="sort-field">
        <span className="label">项目类型</span>
        <select value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)}>
          <option value="">全部</option>
          {PROJECT_TYPES.map((type) => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </label>
      <label className="sort-field">
        <span className="label">排序</span>
        <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          {PROJECT_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
      <span className="list-count">{visibleCount} / {totalCount} 个项目</span>
    </div>
  );
}
