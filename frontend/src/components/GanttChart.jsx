import React from 'react';

// Renders scheduler output as a simple proportional Gantt chart (no chart lib needed)
export default function GanttChart({ gantt }) {
  if (!gantt || gantt.length === 0) return <p style={{ color: '#94a3b8' }}>No scheduling run yet.</p>;
  const maxEnd = Math.max(...gantt.map(g => g.end));
  const colors = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb923c'];

  return (
    <div>
      {gantt.map((seg, i) => (
        <div className="gantt-row" key={i}>
          <div className="gantt-label">{seg.name}</div>
          <div className="gantt-track">
            <div
              className="gantt-block"
              style={{
                left: `${(seg.start / maxEnd) * 100}%`,
                width: `${((seg.end - seg.start) / maxEnd) * 100}%`,
                background: colors[i % colors.length]
              }}
              title={`${seg.name}: ${seg.start} - ${seg.end}`}
            >
              {seg.end - seg.start}
            </div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Timeline: 0 — {maxEnd}</div>
    </div>
  );
}
