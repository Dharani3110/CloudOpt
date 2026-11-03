const fcfs = require('./fcfs');
const sjf = require('./sjf');
const roundRobin = require('./roundRobin');
const priorityScheduling = require('./priority');
const mlfq = require('./mlfq');

function runScheduler(algorithm, jobs, options = {}) {
  switch ((algorithm || '').toUpperCase()) {
    case 'FCFS': return fcfs(jobs);
    case 'SJF': return sjf(jobs);
    case 'RR': return roundRobin(jobs, options.quantum || 4);
    case 'PRIORITY': return priorityScheduling(jobs);
    case 'MLFQ': return mlfq(jobs, options.quanta || [4, 8, 16]);
    default: throw new Error(`Unknown algorithm: ${algorithm}. Use FCFS | SJF | RR | PRIORITY | MLFQ`);
  }
}

// Average waiting/turnaround time — used for the comparison benchmarks (DAA report)
function computeStats(results) {
  const n = results.length || 1;
  const avgWaiting = results.reduce((s, r) => s + (r.waitingTime || 0), 0) / n;
  const avgTurnaround = results.reduce((s, r) => s + (r.turnaroundTime || 0), 0) / n;
  return { avgWaitingTime: Number(avgWaiting.toFixed(2)), avgTurnaroundTime: Number(avgTurnaround.toFixed(2)) };
}

module.exports = { runScheduler, computeStats };
