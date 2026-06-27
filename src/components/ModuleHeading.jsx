export function ModuleHeading({
  title,
  titleEn,
  as: Tag = "h3",
  className = "",
  trailing = null
}) {
  return (
    <div className={["module-heading", className].filter(Boolean).join(" ")}>
      <div className="module-heading-main">
        <Tag>
          {titleEn ? (
            <>
              <span className="module-title-en">{titleEn}</span>
              <span className="module-title-sep" aria-hidden="true"> · </span>
            </>
          ) : null}
          <span>{title}</span>
        </Tag>
      </div>
      {trailing}
    </div>
  );
}
