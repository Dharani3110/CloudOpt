// Priority Scheduling (non-preemptive, lower number = higher priority)
function priorityScheduling(jobs) {
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
    const job = available.sort((a, b) => a.priority - b.priority)[0];
    const start = time;
    const end = start + job.burstTime;
    gantt.push({ jobId: job.id, name: job.name, start, end });
    results.push({ ...job, start, end, waitingTime: start - job.arrivalTime, turnaroundTime: end - job.arrivalTime });
    done.add(job.id);
    time = end;
  }
  return { algorithm: 'Priority', results, gantt };
}

module.exports = priorityScheduling;
