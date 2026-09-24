const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

// Read index.html and make toolbarPanel visible with dummy data
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('id="toolbarPanel" class="toolbar-panel glass-panel" style="display: none;"', 'id="toolbarPanel" class="toolbar-panel glass-panel" style="display: grid;"');
html = html.replace('<strong id="metricTotalRows">0</strong>', '<strong id="metricTotalRows">834</strong>');
html = html.replace('<strong id="metricFilteredRows">0</strong>', '<strong id="metricFilteredRows">834</strong>');
html = html.replace('<strong id="metricTotalCols">0</strong>', '<strong id="metricTotalCols">13/13</strong>');
html = html.replace('<strong id="metricEmptyCells">0%</strong>', '<strong id="metricEmptyCells">0%</strong>');

// Add inline script to measure bounding boxes and dump to console
const scriptToInject = `
<script>
window.addEventListener('load', () => {
  const tp = document.getElementById('toolbarPanel');
  const ms = document.querySelector('.metrics-strip');
  const sb = document.querySelector('.search-box-wrapper');
  const tc = document.querySelector('.toolbar-controls');
  const pills = Array.from(document.querySelectorAll('.metric-pill')).map(p => ({
    text: p.innerText.replace(/\\s+/g, ' ').trim(),
    rect: p.getBoundingClientRect()
  }));

  const data = {
    windowWidth: window.innerWidth,
    toolbarPanel: tp ? tp.getBoundingClientRect() : null,
    metricsStrip: ms ? ms.getBoundingClientRect() : null,
    searchBox: sb ? sb.getBoundingClientRect() : null,
    toolbarControls: tc ? tc.getBoundingClientRect() : null,
    pills
  };
  console.log('LAYOUT_METRICS:' + JSON.stringify(data));
});
</script>
`;

html = html.replace('</body>', scriptToInject + '</body>');
fs.writeFileSync('test_render.html', html);
console.log('test_render.html created.');
