// 0/1 Knapsack (DP) — O(n * budget)
// Given a limited cost budget (e.g. compute-cost units), select the subset of jobs
// that maximizes total "value" (priority weight / business value) without exceeding budget.
function knapsack01(jobs, budget) {
  const n = jobs.length;
  const B = Math.max(0, Math.floor(budget));
  const dp = Array.from({ length: n + 1 }, () => new Array(B + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { cost, value } = jobs[i - 1];
    const c = Math.max(0, Math.floor(cost));
    for (let w = 0; w <= B; w++) {
      dp[i][w] = dp[i - 1][w];
      if (c <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - c] + value);
    }
  }

  // backtrack to find selected jobs
  let w = B;
  const selected = [];
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(jobs[i - 1]);
      w -= Math.max(0, Math.floor(jobs[i - 1].cost));
    }
  }
  selected.reverse();

  return {
    algorithm: '0/1 Knapsack (DP)',
    budget: B,
    maxValue: dp[n][B],
    selectedJobs: selected.map(j => ({ id: j.id, name: j.name, cost: j.cost, value: j.value })),
    rejectedJobs: jobs
      .filter(j => !selected.find(s => s.id === j.id))
      .map(j => ({ id: j.id, name: j.name, cost: j.cost, value: j.value }))
  };
}

module.exports = knapsack01;
