import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const output = join(root, "downloads", "system-design-google-drawings-pack.zip");
const staging = mkdtempSync(join(tmpdir(), "system-design-google-drawings-"));
const pack = join(staging, "System Design Google Drawings Pack");
const png = join(pack, "png");
const jpeg = join(pack, "jpeg");
const svg = join(pack, "svg");

const palette = {
  client: ["#7c3aed", "#ede9fe"],
  network: ["#2563eb", "#dbeafe"],
  compute: ["#0891b2", "#cffafe"],
  data: ["#059669", "#d1fae5"],
  async: ["#d97706", "#fef3c7"],
  observe: ["#e11d48", "#ffe4e6"],
};

const components = [
  ["01-web-client", "Web Client", "Browser or single-page application", "client", '<rect x="102" y="107" width="196" height="124" rx="12"/><path d="M102 140h196M174 260h52M200 231v29"/><circle cx="126" cy="124" r="5"/><circle cx="144" cy="124" r="5"/>'],
  ["02-mobile-client", "Mobile Client", "Native iOS or Android application", "client", '<rect x="153" y="77" width="94" height="184" rx="16"/><path d="M153 109h94M153 229h94"/><circle cx="200" cy="245" r="6"/>'],
  ["03-api", "API", "External API", "network", '<path d="M124 82h152l42 68-42 68H124l-42-68z"/><path d="m174 126-26 24 26 24M226 126l26 24-26 24"/>'],
  ["04-dns", "DNS", "Resolves a name to an endpoint", "network", '<circle cx="200" cy="151" r="77"/><path d="M123 151h154M200 74c24 22 37 48 37 77s-13 55-37 77M200 74c-24 22-37 48-37 77s13 55 37 77"/>'],
  ["05-cdn", "CDN", "Caches content close to users", "network", '<path d="M122 214h151a44 44 0 0 0 0-88 64 64 0 0 0-119-15 52 52 0 0 0-32 103z"/><path d="M200 117v75m-31-31 31 31 31-31"/>'],
  ["06-load-balancer", "Load Balancer", "Distributes traffic across instances", "network", '<path d="M120 93h160v116H120zM120 132h160M154 115h1m26 0h1m26 0h1m26 0h1"/><path d="M200 150v42m0 0-32-27m32 27 32-27"/><rect x="128" y="218" width="40" height="29" rx="4"/><rect x="180" y="218" width="40" height="29" rx="4"/><rect x="232" y="218" width="40" height="29" rx="4"/>'],
  ["07-service", "Service", "Runs one application service instance", "compute", '<rect x="116" y="87" width="168" height="132" rx="14"/><path d="M116 126h168M143 154h114M143 181h72"/><circle cx="141" cy="107" r="5"/><circle cx="159" cy="107" r="5"/>'],
  ["08-service-multiple", "Service · Multiple", "Several stateless service instances", "compute", '<rect x="106" y="95" width="104" height="82" rx="10"/><rect x="190" y="125" width="104" height="82" rx="10"/><path d="M106 123h104m-104 28h72m12-7h104m-104 28h72"/>'],
  ["09-websocket", "WebSocket", "Maintains a bidirectional connection", "compute", '<rect x="104" y="103" width="72" height="103" rx="10"/><rect x="224" y="103" width="72" height="103" rx="10"/><path d="M176 132h48m0 0-15-15m15 15-15 15M224 177h-48m0 0 15-15m-15 15 15 15"/>'],
  ["10-logs", "Logs", "Records discrete operational events", "observe", '<path d="M136 79h105l35 35v120H136z"/><path d="M241 79v35h35M161 145h90m-90 27h90m-90 27h62"/>'],
  ["11-sql-database", "SQL Database", "One relational database instance", "data", '<ellipse cx="200" cy="100" rx="81" ry="28"/><path d="M119 100v89c0 16 36 28 81 28s81-12 81-28v-89M119 145c0 16 36 28 81 28s81-12 81-28"/>'],
  ["12-sql-multiple", "SQL · Multiple", "Primary database with read replicas", "data", '<ellipse cx="144" cy="112" rx="49" ry="18"/><path d="M95 112v59c0 10 22 18 49 18s49-8 49-18v-59M207 147c0-10 22-18 49-18s49 8 49 18v53c0 10-22 18-49 18s-49-8-49-18zM95 145c0 10 22 18 49 18s49-8 49-18"/><path d="M193 151h24m0 0-10-10m10 10-10 10"/>'],
  ["13-nosql-database", "NoSQL Database", "One key-value or document node", "data", '<path d="M119 105h162v99H119z"/><path d="M119 137h162M119 170h162"/><path d="M144 121h52m-52 33h90m-90 33h68"/>'],
  ["14-nosql-multiple", "NoSQL · Multiple", "Replicated or partitioned NoSQL nodes", "data", '<rect x="102" y="103" width="77" height="96" rx="8"/><rect x="201" y="103" width="77" height="96" rx="8"/><path d="M102 133h77m-77 30h77m22-30h77m-77 30h77M179 151h22m0 0-10-10m10 10-10 10"/>'],
  ["15-graph-database", "Graph Database", "Stores and traverses relationships", "data", '<circle cx="136" cy="119" r="20"/><circle cx="263" cy="128" r="20"/><circle cx="191" cy="211" r="20"/><path d="m153 128 90-1m-94 7 31 59m68-49-40 51"/>'],
  ["16-cache-single", "Cache · Single", "One in-memory cache instance", "async", '<path d="M126 106h148v99H126z"/><path d="M126 139h148M152 121h1m19 0h1m19 0h1"/><path d="M165 166h70m-70 22h42"/><path d="M221 90v25m-12-13 12 13 12-13"/>'],
  ["17-cache-cluster", "Cache Cluster", "Multiple cache nodes or shards", "async", '<rect x="106" y="105" width="74" height="91" rx="8"/><rect x="218" y="105" width="74" height="91" rx="8"/><path d="M106 136h74m38 0h74M131 157h24m88 0h24M180 151h38m0 0-12-12m12 12-12 12"/>'],
  ["18-pubsub-topic", "Pub/Sub Topic", "Fans each event out to subscribers", "async", '<circle cx="200" cy="147" r="31"/><circle cx="123" cy="105" r="17"/><circle cx="123" cy="204" r="17"/><circle cx="277" cy="105" r="17"/><circle cx="277" cy="204" r="17"/><path d="M176 136 139 114M176 173l-37 22M224 136l37-22M224 173l37 22"/>'],
  ["19-message-queue", "Message Queue", "Buffers work for competing consumers", "async", '<rect x="93" y="107" width="176" height="86" rx="10"/><path d="M120 134h88M120 150h88M120 166h88M269 150h36m0 0-14-14m14 14-14 14"/>'],
  ["20-monitoring", "Monitoring", "Tracks health, metrics, and alerts", "observe", '<rect x="111" y="88" width="178" height="126" rx="12"/><path d="M111 125h178M132 184l26-25 22 14 33-44 28 32 27-18"/><circle cx="137" cy="106" r="5"/><circle cx="155" cy="106" r="5"/>'],
];

function componentSvg([slug, name, description, group, icon]) {
  const [accent, tint] = palette[group];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-labelledby="title desc">
  <title id="title">${name}</title><desc id="desc">${description}</desc>
  <rect x="18" y="58" width="364" height="284" rx="20" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
  <g transform="translate(0 25)" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
  <text x="200" y="322" text-anchor="middle" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">${name}</text>
</svg>`;
}

const readme = `# System Design Google Drawings Pack

Use the files in **png/** with Google Drawings: choose **Insert → Image → Upload from computer**, then position and connect them with native Google Drawings arrows. Do not drag the ZIP file itself into the canvas—extract it first.

Each component is a compact standard RGB PNG with a white card, an icon, and a name. Google does not import them as editable native shapes.

If Google Drawings rejects a PNG in your browser, use the matching file in **jpeg/**. SVG is deliberately not included because Google Drawings does not support it. The component set mirrors the project's Excalidraw icon sheet.
`;

mkdirSync(png, { recursive: true });
mkdirSync(jpeg, { recursive: true });
mkdirSync(svg, { recursive: true });
writeFileSync(join(pack, "README.md"), readme);

for (const component of components) {
  const [slug] = component;
  const svgFile = join(svg, `${slug}.svg`);
  const pngFile = join(png, `${slug}.png`);
  writeFileSync(svgFile, componentSvg(component));
  execFileSync("qlmanage", ["-t", "-s", "200", "-o", png, svgFile], { stdio: "ignore" });
  renameSync(join(png, `${slug}.svg.png`), pngFile);
  execFileSync("sips", ["-c", "160", "200", "--cropOffset", "0", "0", pngFile, "--out", pngFile], { stdio: "ignore" });
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "best", pngFile, "--out", join(jpeg, `${slug}.jpg`)], { stdio: "ignore" });
}

rmSync(svg, { recursive: true, force: true });
const stagedArchive = join(staging, "system-design-google-drawings-pack.zip");
execFileSync("zip", ["-qr", stagedArchive, "System Design Google Drawings Pack"], { cwd: staging, stdio: "inherit" });
rmSync(output, { force: true });
renameSync(stagedArchive, output);
rmSync(staging, { recursive: true, force: true });
