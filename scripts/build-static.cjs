const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = process.cwd();
const apiDir = path.join(projectRoot, "app", "api");
const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "petshop-api-backup-"));
const backupApiDir = path.join(backupRoot, "api");

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

  const result = spawnSync("npm", ["run", "build"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NEXT_STATIC_EXPORT: "true",
    },
  });

  restoreApiDir();

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
} catch (error) {
  restoreApiDir();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  fs.rmSync(backupRoot, { recursive: true, force: true });
}
