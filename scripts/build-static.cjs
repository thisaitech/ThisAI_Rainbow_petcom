const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = process.cwd();
const apiDir = path.join(projectRoot, "app", "api");
const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "petshop-api-backup-"));
const backupApiDir = path.join(backupRoot, "api");
const exportDir = path.join(projectRoot, "out");
const publicDir = path.join(projectRoot, "public");
const serviceWorkerManifestPath = path.join(publicDir, "sw-assets.json");
const exportedServiceWorkerManifestPath = path.join(exportDir, "sw-assets.json");
const extraPrecacheAssets = ["/videos/rinbow-loader-bird.mp4"];

const runCommand = (command, args, extraEnv = {}) => {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status ?? 1}`);
  }
};

const runNpmScript = (scriptName, extraEnv = {}) => {
  if (process.platform === "win32") {
    runCommand("cmd.exe", ["/d", "/s", "/c", `npm run ${scriptName}`], extraEnv);
    return;
  }

  runCommand("npm", ["run", scriptName], extraEnv);
};

const collectFiles = (directory) => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectFiles(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });
};

const createServiceWorkerAssetManifest = () => {
  const nextStaticDir = path.join(exportDir, "_next", "static");

  if (!fs.existsSync(nextStaticDir)) {
    return;
  }

  const assetPaths = collectFiles(nextStaticDir)
    .map((filePath) => `/${path.relative(exportDir, filePath).split(path.sep).join("/")}`)
    .filter((assetPath) => !assetPath.endsWith(".map"));

  const manifest = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      assetPaths: [...new Set([...assetPaths, ...extraPrecacheAssets])].sort(),
    },
    null,
    2
  );

  fs.writeFileSync(serviceWorkerManifestPath, manifest);
  fs.writeFileSync(exportedServiceWorkerManifestPath, manifest);
};

const restoreApiDir = () => {
  if (fs.existsSync(backupApiDir)) {
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }

    fs.mkdirSync(path.dirname(apiDir), { recursive: true });
    fs.cpSync(backupApiDir, apiDir, { recursive: true });
  }
};

try {
  if (fs.existsSync(apiDir)) {
    fs.cpSync(apiDir, backupApiDir, { recursive: true });
    fs.rmSync(apiDir, { recursive: true, force: true });
  }

  runNpmScript("build", {
    NEXT_STATIC_EXPORT: "true",
    NEXT_PUBLIC_STATIC_EXPORT: "true",
  });
  restoreApiDir();
  createServiceWorkerAssetManifest();
} catch (error) {
  restoreApiDir();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  fs.rmSync(backupRoot, { recursive: true, force: true });
}
