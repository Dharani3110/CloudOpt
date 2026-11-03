// First Come First Served — O(n log n) due to sort, O(n) scheduling pass
function fcfs(jobs) {
  const sorted = [...jobs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let time = 0;
  const gantt = [];
  const results = sorted.map(job => {
    const start = Math.max(time, job.arrivalTime);
    const end = start + job.burstTime;
    gantt.push({ jobId: job.id, name: job.name, start, end });
    const waitingTime = start - job.arrivalTime;
    const turnaroundTime = end - job.arrivalTime;
    time = end;
    return { ...job, start, end, waitingTime, turnaroundTime };
  });
  return { algorithm: 'FCFS', results, gantt };
}

module.exports = fcfs;
