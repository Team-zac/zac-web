import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_PAGE_SIZE, normalizePage, pageCount, pageOffset } from "../src/lib/pagination.ts";
import { canAdminWorldRole, canEditWorldRole } from "../src/lib/roles.ts";
import { normalizeTags } from "../src/lib/tags.ts";

test("normalizeTags removes hash prefixes, commas, spaces, duplicates, and normalizes case", () => {
  assert.deepEqual(
    normalizeTags(" #Fantasy, #판타지  fantasy  #해리포터 "),
    ["fantasy", "판타지", "해리포터"],
  );
});

test("normalizeTags applies a stable limit after de-duplication", () => {
  assert.deepEqual(normalizeTags("#a #b #a #c", { limit: 2 }), ["a", "b"]);
});

test("pagination helpers normalize invalid input and calculate offsets", () => {
  assert.equal(DEFAULT_PAGE_SIZE, 15);
  assert.equal(normalizePage("3"), 3);
  assert.equal(normalizePage("-1"), 1);
  assert.equal(normalizePage("abc"), 1);
  assert.equal(pageOffset(3), 30);
  assert.equal(pageCount(0), 1);
  assert.equal(pageCount(31), 3);
});

test("world role helpers separate edit and admin capabilities", () => {
  assert.equal(canEditWorldRole("OWNER"), true);
  assert.equal(canEditWorldRole("ADMIN"), true);
  assert.equal(canEditWorldRole("EDITOR"), true);
  assert.equal(canEditWorldRole("VIEWER"), false);
  assert.equal(canEditWorldRole(null), false);

  assert.equal(canAdminWorldRole("OWNER"), true);
  assert.equal(canAdminWorldRole("ADMIN"), true);
  assert.equal(canAdminWorldRole("EDITOR"), false);
  assert.equal(canAdminWorldRole("VIEWER"), false);
});
