export function BoardHeader({ stats, filters, filterOptions, onFilterChange }) {
  return (
    <section className="board-header">
      <div className="title-row">
        <div>
          <h2>项目看板</h2>
          <p>按阶段推进需求、开发、测试与复核，支持直接填写卡片与批注。</p>
        </div>
        <div className="stats" aria-label="看板统计">
          <Stat value={stats.total} label="总任务" />
          <Stat value={stats.doing} label="进行中" />
          <Stat value={stats.done} label="已完成" />
        </div>
      </div>
      <div className="filters">
        <FilterField label="搜索">
          <input value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} type="search" placeholder="搜索标题或描述" />
        </FilterField>
        <FilterField label="优先级">
          <select value={filters.priority} onChange={(event) => onFilterChange("priority", event.target.value)}>
            <option value="">全部优先级</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
        </FilterField>
        <FilterField label="端">
          <select value={filters.platform} onChange={(event) => onFilterChange("platform", event.target.value)}>
            <option value="">全部端</option>
            <option value="PC 端">PC 端</option>
            <option value="移动端">移动端</option>
            <option value="后端">后端</option>
            <option value="AI">AI</option>
          </select>
        </FilterField>
        <FilterField label="产品线">
          <select value={filters.product} onChange={(event) => onFilterChange("product", event.target.value)}>
            <option value="">全部产品线</option>
            {filterOptions.products.map((product) => <option key={product} value={product}>{product}</option>)}
          </select>
        </FilterField>
        <FilterField label="负责人">
          <select value={filters.owner} onChange={(event) => onFilterChange("owner", event.target.value)}>
            <option value="">全部负责人</option>
            {filterOptions.owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </FilterField>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return <div className="stat"><strong>{value}</strong><span>{label}</span></div>;
}

function FilterField({ label, children }) {
  return <label className="field"><span className="label">{label}</span>{children}</label>;
}
