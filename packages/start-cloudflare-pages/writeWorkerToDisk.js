import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";

async function write() {
  const { onRequestGet } = await import(join("file://", process.argv[2]));
  const request = new Request(process.argv[4]);
  const res = await onRequestGet({
    request,
    env: {},
    next: () => {
      throw new Error("next() not implemented");
    }
  });

  await mkdir(dirname(process.argv[3]), { recursive: true });
  await writeFile(process.argv[3], await res.text());
  process.exit(0);
}

write();
