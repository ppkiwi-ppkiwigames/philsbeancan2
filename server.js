import express from "express";
import { createServer } from "node:http";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const require = createRequire(import.meta.url);

// Epoxy 3.x does not export epoxyPath or expose package.json.
// Resolve its installed entry point instead.
const epoxyPath = dirname(
  require.resolve("@mercuryworkshop/epoxy-transport")
);

const app = express();

// Cross-origin settings
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  next();
});

// Allow the UV service worker to control the site
app.use("/uv/sw.js", (req, res, next) => {
  res.setHeader("Service-Worker-Allowed", "/");
  next();
});

// Math Time files
app.use(express.static(join(__dirname, "public")));

// Ultraviolet
app.use("/uv/", express.static(uvPath));

// Epoxy transport
app.use("/epoxy/", express.static(epoxyPath));

// BareMux
app.use("/baremux/", express.static(baremuxPath));

// Ultraviolet static files
app.use("/", express.static(publicPath));

const server = createServer(app);

const port = Number(process.env.PORT || 8080);

server.listen(port, () => {
  console.log(`Math Time running at http://localhost:${port}`);
  console.log("Wisp transport: wss://wisp.mercurywork.shop/");
});