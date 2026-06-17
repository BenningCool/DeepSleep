export function BoardHeader({ stats, filters, filterOptions, onFilterChange }) {
  return (
    <section className="board-header">
      <div className="title-row">
        <div>
          <h2>Project Kanban</h2>
          <p>Move requirements, development, testing, and review through stages. Cards and comments can be edited directly.</p>
        </div>
        <div className="stats" aria-label="Kanban Statistics">
          <Stat value={stats.total} label="Total Tasks" />
          <Stat value={stats.doing} label="In Progress" />
          <Stat value={stats.done} label="Completed" />
        </div>
      </div>
      <div className="filters">
        <FilterField label="Search">
          <input value={filters.search} onChange={(event) => onFilterChange("search", event.target.value)} type="search" placeholder="Search title or description" />
        </FilterField>
        <FilterField label="Priority">
          <select value={filters.priority} onChange={(event) => onFilterChange("priority", event.target.value)}>
            <option value="">All Priorities</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
        </FilterField>
        <FilterField label="Platform">
          <select value={filters.platform} onChange={(event) => onFilterChange("platform", event.target.value)}>
            <option value="">All Platforms</option>
            <option value="PC">PC</option>
            <option value="Mobile">Mobile</option>
            <option value="Backend">Backend</option>
            <option value="AI">AI</option>
          </select>
        </FilterField>
        <FilterField label="Product Line">
          <select value={filters.product} onChange={(event) => onFilterChange("product", event.target.value)}>
            <option value="">All Product Lines</option>
            {filterOptions.products.map((product) => <option key={product} value={product}>{product}</option>)}
          </select>
        </FilterField>
        <FilterField label="Owner">
          <select value={filters.owner} onChange={(event) => onFilterChange("owner", event.target.value)}>
            <option value="">AllOwner</option>
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
