#!/usr/bin/env node
/** 部署后验证 Render 云端是否正常运行 */
const base = process.argv[2] ?? process.env.TTWM_CLOUD_URL;
if (!base) {
  console.error('用法: node scripts/verify-cloud-deploy.mjs https://your-app.onrender.com');
  process.exit(1);
}

const url = base.replace(/\/$/, '');

async function check(path) {
  const res = await fetch(`${url}${path}`);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { ok: res.ok, status: res.status, json };
}

const health = await check('/api/health');
const evo = await check('/api/evolution/status');

console.log('\n=== TTWorldMonitor 云端部署验证 ===\n');
console.log('Health:', health.status, health.ok ? 'OK' : 'FAIL');
if (health.json && typeof health.json === 'object') {
  console.log('  cloud:', health.json.cloud);
  console.log('  evolution:', health.json.evolution?.running ? 'running' : 'stopped');
}
console.log('\nEvolution:', evo.status, evo.ok ? 'OK' : 'FAIL');
if (evo.json && typeof evo.json === 'object') {
  console.log('  tickCount:', evo.json.tickCount);
  console.log('  lastTickAt:', evo.json.lastTickAt);
  console.log('  intervalMs:', evo.json.intervalMs);
}
console.log('\n仪表盘:', url);
console.log('进化页:', `${url}/evolution`);
console.log('运动实验室:', `${url}/motion-lab`);
console.log('');

if (!health.ok || !evo.ok) process.exit(1);
