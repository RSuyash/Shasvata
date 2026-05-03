import { rmSync } from "node:fs";

for (const path of [".turbo", "coverage"]) {
  rmSync(path, { recursive: true, force: true });
}
