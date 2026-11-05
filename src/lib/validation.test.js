import { describe, expect, it } from "vitest";
import { validateVisit } from "./validation.js";

const today = new Date(2026, 10, 5); // 5 Nov 2026
const ok = { name: "Priya", phone: "98765 43210", date: "2026-11-08", slot: "11:30 AM" };

describe("validateVisit", () => {
  it("accepts a valid booking", () => expect(validateVisit(ok, today)).toEqual({}));
  it("accepts +91 prefixes and spaces in phone numbers", () => {
    expect(validateVisit({ ...ok, phone: "+91 98765-43210" }, today)).toEqual({});
  });
  it("rejects short names, bad phones, past dates and missing slots", () => {
    const e = validateVisit({ name: " A ", phone: "12345", date: "2026-11-01", slot: "" }, today);
    expect(Object.keys(e).sort()).toEqual(["date", "name", "phone", "slot"]);
  });
  it("allows booking for today", () => {
    expect(validateVisit({ ...ok, date: "2026-11-05" }, today).date).toBeUndefined();
  });
});
