/** Filter projects by status chip, type chip and a free-text search. */
export function filterProjects(projects, { status = "all", type = "all", query = "" } = {}) {
  const q = query.trim().toLowerCase();
  return projects.filter((p) =>
    (status === "all" || p.status === status) &&
    (type === "all" || p.type === type) &&
    (!q || `${p.name} ${p.location}`.toLowerCase().includes(q))
  );
}
