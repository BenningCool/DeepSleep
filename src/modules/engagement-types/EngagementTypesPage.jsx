import { ModuleHeading } from "../../components/ModuleHeading";
import { PAGE_LABELS } from "../../data/pageLabels";
import { listEngagementTypeCards } from "../../data/engagementTypeProfiles";
import { labelOfProjectType } from "../../data/projectConstants";

export function EngagementTypesPage({
  onViewDemo,
  onCreateWithType
}) {
  const cards = listEngagementTypeCards();

  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <ModuleHeading
            as="h2"
            title={PAGE_LABELS.engagementTypes.title}
            titleEn={PAGE_LABELS.engagementTypes.titleEn}
          />
          <p className="page-note">
            五类项目类型在界面与叙事上区分展示；测试点仍在工作台维护，类型不自动生成不同骨架。
          </p>
        </div>
      </header>

      <div className="engagement-type-grid">
        {cards.map(({ id, label, profile }) => (
          <article
            key={id}
            className={`engagement-type-card project-type-skin project-type-${id}`}
            style={{ "--type-accent": profile.color }}
          >
            <div className="engagement-type-accent" aria-hidden="true" />
            <div className="engagement-type-body">
              <div className="engagement-type-head">
                <span className="type-badge large">{profile.badge}</span>
                <span className="engagement-type-tagline">{profile.tagline}</span>
              </div>
              <h3>{labelOfProjectType(id)}</h3>
              <dl className="engagement-type-meta">
                <div>
                  <dt>Primary team</dt>
                  <dd>{profile.primaryTeamLabel}</dd>
                </div>
                <div>
                  <dt>Typical collaboration</dt>
                  <dd>{profile.collaboration}</dd>
                </div>
                <div>
                  <dt>Progress focus</dt>
                  <dd>{profile.progressFocus}</dd>
                </div>
              </dl>
              {profile.demoNote ? (
                <p className="engagement-type-note">{profile.demoNote}</p>
              ) : null}
              <div className="engagement-type-actions">
                <button
                  className="button primary"
                  type="button"
                  onClick={() => onViewDemo(id)}
                  disabled={!profile.demoProjectId}
                >
                  查看示例
                </button>
                <button
                  className="button subtle"
                  type="button"
                  onClick={() => onCreateWithType(id)}
                >
                  以此类型创建
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
