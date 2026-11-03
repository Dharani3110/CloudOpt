// Multi-Level Feedback Queue — 3 levels, quanta escalate: 4 -> 8 -> 16 (FCFS at last level)
function mlfq(jobs, quanta = [4, 8, 16]) {
  const pending = jobs
    .map(j => ({ ...j, remaining: j.burstTime, level: 0 }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime);

  let time = 0;
  let i = 0;
  const n = pending.length;
  const queues = [[], [], []];
  const gantt = [];
  const completion = {};

  function pushArrived() {
    while (i < n && pending[i].arrivalTime <= time) {
      queues[0].push(pending[i]);
      i++;
    }
  }
  pushArrived();
  if (queues.every(q => q.length === 0) && n > 0) {
    time = pending[0].arrivalTime;
    pushArrived();
  }

  while (queues[0].length || queues[1].length || queues[2].length) {
    const level = queues.findIndex(q => q.length > 0);
    const job = queues[level].shift();
    const q = quanta[level] ?? quanta[quanta.length - 1];
    const start = Math.max(time, job.arrivalTime);
    const run = Math.min(q, job.remaining);
    const end = start + run;
    gantt.push({ jobId: job.id, name: job.name, start, end, level });
    job.remaining -= run;
    time = end;
    pushArrived();
    if (job.remaining > 0) {
      const nextLevel = Math.min(level + 1, quanta.length - 1);
      job.level = nextLevel;
      queues[nextLevel].push(job);
    } else {
      completion[job.id] = end;
    }
  }

  const results = pending.map(job => {
    const end = completion[job.id];
    const turnaroundTime = end - job.arrivalTime;
    const waitingTime = turnaroundTime - job.burstTime;
    return { ...job, end, turnaroundTime, waitingTime };
  });

  return { algorithm: 'MLFQ', quanta, results, gantt };
}

module.exports = mlfq;
