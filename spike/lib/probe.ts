export type Check = { id: string; pass: boolean; detail: string };

export function report(checks: Check[]): Response {
  const pass = checks.every((c) => c.pass);
  return Response.json({ checks, pass }, { status: pass ? 200 : 500 });
}

export function printChecks(checks: Check[]): never {
  for (const c of checks) {
    console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.id} ${c.detail}`);
  }
  process.exit(checks.every((c) => c.pass) ? 0 : 1);
}
