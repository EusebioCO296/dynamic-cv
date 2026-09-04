import assert from "node:assert/strict";
import { formatDateRangeHelper } from "./index.ts";

// EN, mid-year date
{
  const { formattedStart, formattedEnd } = formatDateRangeHelper({
    startDate: "2025-06-01",
    endDate: null,
    current: true,
  });
  assert.equal(formattedStart, "Jun-2025");
  assert.equal(formattedEnd, "Present");
}

// ES, Dic
{
  const { formattedStart, formattedEnd } = formatDateRangeHelper(
    {
      startDate: "2023-12-01",
      endDate: "2023-12-01",
      current: false,
    },
    "es",
  );
  assert.equal(formattedStart, "Dic-2023");
  assert.equal(formattedEnd, "Dic-2023");
}

// ES, current -> Presente
{
  const { formattedEnd } = formatDateRangeHelper(
    {
      startDate: "2020-01-01",
      current: true,
    },
    "es",
  );
  assert.equal(formattedEnd, "Presente");
}

// Timezone edge case: day-1 dates should not roll back a month (UTC parsing)
{
  const months = [
    ["2025-01-01", "Jan-2025"],
    ["2025-02-01", "Feb-2025"],
    ["2025-03-01", "Mar-2025"],
    ["2025-11-01", "Nov-2025"],
  ];
  for (const [input, expected] of months) {
    const { formattedStart } = formatDateRangeHelper({
      startDate: input,
      current: true,
    });
    assert.equal(formattedStart, expected, `expected ${input} -> ${expected}`);
  }
}

console.log("All formatDateRangeHelper checks passed.");
