const defaults = Object.freeze({
  dailyUsers: 500_000_000,
  requestsPerUser: 20,
  peakMultiplier: 3,
  serverCapacity: 1_000,
  targetUtilization: 70,
  requestSize: 2,
  responseSize: 25,
  objectsPerDay: 250_000,
  objectSizeMb: 50,
  metadataSizeKb: 20,
  retentionDays: 365,
  storageCopies: 3,
});

const fields = Object.fromEntries(
  Object.keys(defaults).map((id) => [id, document.getElementById(id)]),
);

const outputs = {
  peakMultiplier: document.getElementById('peakMultiplierOutput'),
  dailyUsersReadable: document.getElementById('dailyUsersReadable'),
  servers: document.getElementById('serversRequired'),
  serverFormula: document.getElementById('serverFormula'),
  requestsPerDay: document.getElementById('requestsPerDay'),
  averageRps: document.getElementById('averageRps'),
  peakRps: document.getElementById('peakRps'),
  peakFormula: document.getElementById('peakFormula'),
  effectiveCapacity: document.getElementById('effectiveCapacity'),
  utilizationNote: document.getElementById('utilizationNote'),
  dailyTransfer: document.getElementById('dailyTransfer'),
  peakBandwidth: document.getElementById('peakBandwidth'),
  storageCopies: document.getElementById('storageCopiesOutput'),
  rawStoragePerDay: document.getElementById('rawStoragePerDay'),
  provisionedStoragePerDay: document.getElementById('provisionedStoragePerDay'),
  storageCopiesNote: document.getElementById('storageCopiesNote'),
  monthlyStorageGrowth: document.getElementById('monthlyStorageGrowth'),
  retainedStorage: document.getElementById('retainedStorage'),
  retainedStorageFormula: document.getElementById('retainedStorageFormula'),
};

const formatter = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });

function safeNumber(field, fallback = 0) {
  const value = Number(field.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function compactNumber(value, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';

  return new Intl.NumberFormat('en-GB', {
    notation: value >= 1_000 ? 'compact' : 'standard',
    maximumFractionDigits,
  }).format(value);
}

function humanNumber(value) {
  if (!Number.isFinite(value)) return '—';

  return new Intl.NumberFormat('en-GB', {
    notation: value >= 1_000 ? 'compact' : 'standard',
    compactDisplay: 'long',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatBytes(decimalBytes) {
  if (!Number.isFinite(decimalBytes) || decimalBytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  const unitIndex = Math.min(Math.floor(Math.log(decimalBytes) / Math.log(1000)), units.length - 1);
  const value = decimalBytes / 1000 ** unitIndex;
  return `${formatter.format(value)} ${units[unitIndex]}`;
}

function formatBitsPerSecond(bitsPerSecond) {
  if (!Number.isFinite(bitsPerSecond) || bitsPerSecond <= 0) return '0 bps';
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps'];
  const unitIndex = Math.min(Math.floor(Math.log(bitsPerSecond) / Math.log(1000)), units.length - 1);
  const value = bitsPerSecond / 1000 ** unitIndex;
  return `${formatter.format(value)} ${units[unitIndex]}`;
}

function calculate() {
  const dailyUsers = safeNumber(fields.dailyUsers);
  const requestsPerUser = safeNumber(fields.requestsPerUser);
  const peakMultiplier = Math.max(1, safeNumber(fields.peakMultiplier, 1));
  const serverCapacity = Math.max(1, safeNumber(fields.serverCapacity, 1));
  const utilization = Math.min(100, Math.max(1, safeNumber(fields.targetUtilization, 1))) / 100;
  const requestSizeKb = safeNumber(fields.requestSize);
  const responseSizeKb = safeNumber(fields.responseSize);
  const objectsPerDay = safeNumber(fields.objectsPerDay);
  const objectSizeMb = safeNumber(fields.objectSizeMb);
  const metadataSizeKb = safeNumber(fields.metadataSizeKb);
  const retentionDays = safeNumber(fields.retentionDays);
  const storageCopies = Math.max(1, safeNumber(fields.storageCopies, 1));

  const requestsPerDay = dailyUsers * requestsPerUser;
  const averageRps = requestsPerDay / 86_400;
  const peakRps = averageRps * peakMultiplier;
  const effectiveCapacity = serverCapacity * utilization;
  const servers = requestsPerDay === 0 ? 0 : Math.ceil(peakRps / effectiveCapacity);
  const payloadBytes = (requestSizeKb + responseSizeKb) * 1000;
  const dailyTransferBytes = requestsPerDay * payloadBytes;
  const peakBitsPerSecond = peakRps * payloadBytes * 8;
  const bytesPerObject = objectSizeMb * 1_000_000 + metadataSizeKb * 1_000;
  const rawStoragePerDay = objectsPerDay * bytesPerObject;
  const provisionedStoragePerDay = rawStoragePerDay * storageCopies;
  const monthlyStorageGrowth = provisionedStoragePerDay * 30;
  const retainedStorage = provisionedStoragePerDay * retentionDays;

  outputs.peakMultiplier.textContent = `${formatter.format(peakMultiplier)}×`;
  outputs.dailyUsersReadable.textContent = humanNumber(dailyUsers);
  outputs.servers.textContent = formatter.format(servers);
  outputs.serverFormula.textContent = `${compactNumber(peakRps)} peak RPS ÷ ${compactNumber(effectiveCapacity)} effective RPS/server = ${formatter.format(servers)} servers`;
  outputs.requestsPerDay.textContent = compactNumber(requestsPerDay, 2);
  outputs.averageRps.textContent = compactNumber(averageRps, 2);
  outputs.peakRps.textContent = compactNumber(peakRps, 2);
  outputs.peakFormula.textContent = `${compactNumber(averageRps)} average × ${formatter.format(peakMultiplier)}`;
  outputs.effectiveCapacity.textContent = compactNumber(effectiveCapacity);
  outputs.utilizationNote.textContent = `${formatter.format(utilization * 100)}% of ${compactNumber(serverCapacity)} configured RPS`;
  outputs.dailyTransfer.textContent = formatBytes(dailyTransferBytes);
  outputs.peakBandwidth.textContent = formatBitsPerSecond(peakBitsPerSecond);
  outputs.storageCopies.textContent = `${formatter.format(storageCopies)}×`;
  outputs.rawStoragePerDay.textContent = formatBytes(rawStoragePerDay);
  outputs.provisionedStoragePerDay.textContent = formatBytes(provisionedStoragePerDay);
  outputs.storageCopiesNote.textContent = `${formatter.format(storageCopies)}× durability overhead`;
  outputs.monthlyStorageGrowth.textContent = formatBytes(monthlyStorageGrowth);
  outputs.retainedStorage.textContent = formatBytes(retainedStorage);
  outputs.retainedStorageFormula.textContent = `${formatBytes(provisionedStoragePerDay)}/day × ${formatter.format(retentionDays)} days`;

  const resultGrids = [
    document.getElementById('resultGrid'),
    document.getElementById('storageResultGrid'),
  ];
  resultGrids.forEach((grid) => grid.classList.remove('result-enter'));
  requestAnimationFrame(() => resultGrids.forEach((grid) => grid.classList.add('result-enter')));
}

function reset() {
  Object.entries(defaults).forEach(([id, value]) => {
    fields[id].value = value;
  });
  calculate();
}

document.getElementById('calculatorForm').addEventListener('input', calculate);
document.getElementById('storageForm').addEventListener('input', calculate);
document.getElementById('resetButton').addEventListener('click', reset);

calculate();
