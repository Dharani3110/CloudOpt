// Shortest Job First (non-preemptive) — O(n^2) naive selection, fine for job-queue scale
function sjf(jobs) {
  const pending = jobs.map(j => ({ ...j }));
  const done = new Set();
  let time = 0;
  const gantt = [];
  const results = [];

  while (done.size < pending.length) {
    const available = pending.filter(j => !done.has(j.id) && j.arrivalTime <= time);
    if (available.length === 0) {
      const next = pending
        .filter(j => !done.has(j.id))
        .sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      time = next.arrivalTime;
      continue;
    }
    const job = available.sort((a, b) => a.burstTime - b.burstTime)[0];
    const start = time;
    const end = start + job.burstTime;
    gantt.push({ jobId: job.id, name: job.name, start, end });
    results.push({ ...job, start, end, waitingTime: start - job.arrivalTime, turnaroundTime: end - job.arrivalTime });
    done.add(job.id);
    time = end;
  }
  return { algorithm: 'SJF', results, gantt };
}

module.exports = sjf;
