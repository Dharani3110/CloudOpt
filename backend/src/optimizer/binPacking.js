// First-Fit-Decreasing bin packing — O(n log n + n*bins)
// Packs jobs (by memory requirement) into the minimum number of fixed-capacity "VMs"/bins.
function binPackingFFD(jobs, binCapacityMB) {
  const sorted = [...jobs].sort((a, b) => b.memoryMB - a.memoryMB);
  const bins = [];

  for (const job of sorted) {
    let placed = false;
    for (const bin of bins) {
      if (bin.used + job.memoryMB <= binCapacityMB) {
        bin.jobs.push({ id: job.id, name: job.name, memoryMB: job.memoryMB });
        bin.used += job.memoryMB;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins.push({
        binIndex: bins.length,
        capacity: binCapacityMB,
        used: job.memoryMB,
        jobs: [{ id: job.id, name: job.name, memoryMB: job.memoryMB }]
      });
    }
  }

  const totalBinsUsed = bins.length;
  const utilization = bins.map(b => ({
    binIndex: b.binIndex,
    usedMB: b.used,
    capacityMB: b.capacity,
    utilizationPct: Number(((b.used / b.capacity) * 100).toFixed(1))
  }));

  return { algorithm: 'Bin Packing (First-Fit-Decreasing)', binCapacityMB, totalBinsUsed, bins, utilization };
}

module.exports = binPackingFFD;
