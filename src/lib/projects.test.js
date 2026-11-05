import { describe, expect, it } from "vitest";
import { filterProjects } from "./projects.js";

const list = [
  { name: "Skyline", location: "Whitefield", status: "ongoing", type: "apartment" },
  { name: "Palm Grove", location: "Sarjapur Road", status: "ready", type: "villa" },
  { name: "Meridian", location: "Hebbal", status: "upcoming", type: "apartment" },
];

describe("filterProjects", () => {
  it("returns everything with default filters", () => expect(filterProjects(list)).toHaveLength(3));
  it("filters by status and type together", () => {
    expect(filterProjects(list, { status: "ongoing", type: "apartment" }).map((p) => p.name)).toEqual(["Skyline"]);
    expect(filterProjects(list, { status: "ready", type: "apartment" })).toEqual([]);
  });
  it("searches name and location, ignoring case and spaces", () => {
    expect(filterProjects(list, { query: "  HEBBAL " }).map((p) => p.name)).toEqual(["Meridian"]);
    expect(filterProjects(list, { query: "palm" }).map((p) => p.name)).toEqual(["Palm Grove"]);
  });
});
