import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickUtmParams, safeRelativePath, utmToMetadata } from "./utm.ts";

describe("utm", () => {
  it("keeps only known utm keys and trims values", () => {
    const utm = pickUtmParams({
      utm_source: " reddit ",
      utm_campaign: "sprint1003",
      utm_medium: "",
      evil: "drop-me",
    });
    assert.deepEqual(utm, {
      utm_source: "reddit",
      utm_campaign: "sprint1003",
    });
    assert.deepEqual(utmToMetadata(utm), {
      utm_source: "reddit",
      utm_campaign: "sprint1003",
    });
  });

  it("reads from URLSearchParams the same way as the buy button", () => {
    const params = new URLSearchParams(
      "utm_source=gumroad&utm_campaign=sprint1003&foo=1",
    );
    assert.deepEqual(pickUtmParams(params), {
      utm_source: "gumroad",
      utm_campaign: "sprint1003",
    });
  });

  it("rejects open-redirect cancel paths", () => {
    assert.equal(safeRelativePath("/free?utm_source=cold"), "/free?utm_source=cold");
    assert.equal(safeRelativePath("//evil.example"), "/");
    assert.equal(safeRelativePath("https://evil.example"), "/");
    assert.equal(safeRelativePath("/partners"), "/partners");
  });
});
