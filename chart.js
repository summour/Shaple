/* ============================================================
   CHART.JS — Custom Canvas Chart (no external lib needed)
   ============================================================ */

function drawLineChart(canvasId, labels, values, color = '#3b82f6') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const dpr    = window.devicePixelRatio || 1;
  const rect   = canvas.getBoundingClientRect();
  const W      = rect.width  || canvas.parentElement.clientWidth || 300;
  const H      = parseInt(canvas.getAttribute('height')) || 140;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad   = { top: 20, right: 20, bottom: 30, left: 36 };
  const cW    = W - pad.left - pad.right;
  const cH    = H - pad.top  - pad.bottom;

  const min   = Math.floor(Math.min(...values) - 2);
  const max   = Math.ceil(Math.max(...values)  + 2);
  const range = max - min || 1;

  const xStep = cW / (values.length - 1);

  function xOf(i) { return pad.left + i * xStep; }
  function yOf(v) { return pad.top  + cH * (1 - (v - min) / range); }

  // Grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth   = 1;
  const gridCount = 4;
  for (let g = 0; g <= gridCount; g++) {
    const y = pad.top + cH * (g / gridCount);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();

    // Y labels
    const val = max - (range * g / gridCount);
    ctx.fillStyle    = '#94a3b8';
    ctx.font         = '10px DM Sans, sans-serif';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(val.toFixed(0), pad.left - 4, y);
  }

  // Gradient fill under line
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0,   color + '33');
  grad.addColorStop(1,   color + '00');

  ctx.beginPath();
  ctx.moveTo(xOf(0), yOf(values[0]));
  for (let i = 1; i < values.length; i++) {
    ctx.lineTo(xOf(i), yOf(values[i]));
  }
  ctx.lineTo(xOf(values.length - 1), pad.top + cH);
  ctx.lineTo(xOf(0), pad.top + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(xOf(0), yOf(values[0]));
  for (let i = 1; i < values.length; i++) {
    ctx.lineTo(xOf(i), yOf(values[i]));
  }
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = 'round';
  ctx.stroke();

  // Points + value labels
  for (let i = 0; i < values.length; i++) {
    const x = xOf(i);
    const y = yOf(values[i]);

    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle   = color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth   = 2;
    ctx.stroke();

    ctx.fillStyle    = '#334155';
    ctx.font         = '11px DM Sans, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(values[i].toFixed(1), x, y - 7);

    // X axis label
    ctx.fillStyle    = '#94a3b8';
    ctx.font         = '10px DM Sans, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labels[i], x, pad.top + cH + 6);
  }
}
