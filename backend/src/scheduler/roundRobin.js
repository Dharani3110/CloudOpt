// Round Robin — O(n * bursts/quantum)
function roundRobin(jobs, quantum = 4) {
  const queueJobs = jobs
    .map(j => ({ ...j, remaining: j.burstTime }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime);

  let time = 0;
  let i = 0;
  const n = queueJobs.length;
  const queue = [];
  const gantt = [];
  const completion = {};

  function pushArrived() {
    while (i < n && queueJobs[i].arrivalTime <= time) {
      queue.push(queueJobs[i]);
      i++;
    }
  }
  pushArrived();
  if (queue.length === 0 && n > 0) {
    time = queueJobs[0].arrivalTime;
    pushArrived();
  }

  while (queue.length > 0) {
    const job = queue.shift();
    const start = Math.max(time, job.arrivalTime);
    const run = Math.min(quantum, job.remaining);
    const end = start + run;
    gantt.push({ jobId: job.id, name: job.name, start, end });
    job.remaining -= run;
    time = end;
    pushArrived();
    if (job.remaining > 0) queue.push(job);
    else completion[job.id] = end;
  }

  const results = queueJobs.map(job => {
    const end = completion[job.id];
    const turnaroundTime = end - job.arrivalTime;
    const waitingTime = turnaroundTime - job.burstTime;
    return { ...job, end, turnaroundTime, waitingTime };
  });

  return { algorithm: 'Round Robin', quantum, results, gantt };
}

module.exports = roundRobin;
