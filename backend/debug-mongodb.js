// ============================================================
//  MongoDB Atlas Windows Debug Script
//  Run: node debug-mongodb.js
// ============================================================

const dns  = require("dns");
const net  = require("net");
const { execSync } = require("child_process");

const MONGO_SRV_HOST  = "adityasen-cluster.kprjses.mongodb.net";
const MONGO_SRV_QUERY = "_mongodb._tcp." + MONGO_SRV_HOST;
const SHARD_HOST      = "ac-ctqincn-shard-00-00.kprjses.mongodb.net";
const MONGO_PORT      = 27017;

function step(title) {
  console.log("\n" + "=".repeat(60));
  console.log(" " + title);
  console.log("=".repeat(60));
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", timeout: 10000 }).trim();
  } catch (e) {
    return "(failed) " + (e.stderr || e.message || "").trim();
  }
}

// ── Step 1: Node DNS servers ──────────────────────────────────
step("1. DNS servers Node.js is using");
console.log(dns.getServers());

// ── Step 2: A-record lookup via Node (no override) ───────────
step("2. A-record lookup for google.com (default Node DNS)");
dns.resolve4("google.com", (err, addrs) => {
  if (err) console.log("FAIL:", err.message);
  else     console.log("OK:", addrs[0]);
});

// ── Step 3: SRV lookup via Node (no override) ────────────────
step("3. SRV lookup for MongoDB cluster (default Node DNS)");
dns.resolveSrv(MONGO_SRV_QUERY, (err, addrs) => {
  if (err) console.log("FAIL:", err.message);
  else     console.log("OK:", addrs[0]);

  // ── Step 4: SRV lookup with forced 8.8.8.8 ─────────────────
  step("4. SRV lookup with dns.setServers(['8.8.8.8', '8.8.4.4'])");
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  dns.resolveSrv(MONGO_SRV_QUERY, (err2, addrs2) => {
    if (err2) console.log("FAIL:", err2.message);
    else      console.log("OK:", addrs2[0]);

    // ── Step 5: TCP connection to port 27017 ──────────────────
    step("5. TCP connect to shard host on port 27017");
    const socket = net.createConnection({ host: SHARD_HOST, port: MONGO_PORT }, () => {
      console.log("OK: port 27017 is REACHABLE");
      socket.destroy();
      afterNetworkChecks();
    });
    socket.setTimeout(8000);
    socket.on("timeout", () => { console.log("TIMEOUT: port 27017 is BLOCKED"); socket.destroy(); afterNetworkChecks(); });
    socket.on("error",   (e) => { console.log("FAIL:", e.message); afterNetworkChecks(); });
  });
});

function afterNetworkChecks() {
  // ── Step 6: nslookup SRV ───────────────────────────────────
  step("6. nslookup SRV (system resolver)");
  console.log(run(`nslookup -type=SRV ${MONGO_SRV_QUERY}`));

  // ── Step 7: Your public IP ─────────────────────────────────
  step("7. Your public IP (must be whitelisted in Atlas)");
  try {
    const http = require("http");
    http.get("http://api.ipify.org", (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end",  () => {
        console.log("Public IP:", data.trim());
        afterIp();
      });
    }).on("error", (e) => { console.log("Could not fetch public IP:", e.message); afterIp(); });
  } catch (e) {
    console.log("Could not fetch public IP:", e.message);
    afterIp();
  }
}

function afterIp() {
  // ── Step 8: What is on port 53 ────────────────────────────
  step("8. What is listening on port 53 (DNS)");
  console.log(run("powershell.exe -Command \"netstat -ano | Select-String ':53 '\""));

  // ── Step 9: System DNS adapter config ─────────────────────
  step("9. System DNS server addresses");
  console.log(run("powershell.exe -Command \"Get-DnsClientServerAddress | Where-Object { $_.AddressFamily -eq 2 } | Select-Object InterfaceAlias, ServerAddresses | Format-List\""));

  // ── Step 10: Summary ──────────────────────────────────────
  step("10. Summary / what to fix");
  const servers = dns.getServers();
  if (servers.includes("127.0.0.1") || servers.includes("::1")) {
    console.log(
      "ISSUE FOUND: Node.js is using the local Windows DNS Client (127.0.0.1).\n" +
      "The Windows DNS service only exposes UDP on port 53, but Node.js (c-ares)\n" +
      "uses TCP for SRV lookups and gets ECONNREFUSED.\n\n" +
      "FIX already applied in index.js:\n" +
      "  const dns = require('dns');\n" +
      "  dns.setServers(['8.8.8.8', '8.8.4.4']);\n" +
      "(Add these two lines at the top of index.js, before mongoose.connect)"
    );
  } else {
    console.log("Node.js DNS looks correct:", servers);
  }
}
