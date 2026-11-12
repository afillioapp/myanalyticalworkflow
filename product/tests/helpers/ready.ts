// Fills in whatever a request still needs to pass the quality gate (plans/P4.md section 4),
// so tests about other things can sign off. Uses only the app's own store functions.
import type { Db } from "@/db/client";
import type { Actor } from "@/model/log";
import { OPTIONAL_STEPS } from "@/requests/intake";
import { readRequest, recordIntake, setCoverage, setMode, setSponsor, setTrigger, skipIntake } from "@/requests/store";

export async function readyForSignOff(db: Db, actor: Actor, requestId: string, mode: "request" | "mandate" = "request") {
  let s = await readRequest(db, actor, requestId);
  if (!s.request.trigger) await setTrigger(db, actor, requestId, "regulatory_change");
  if (!s.request.mode) await setMode(db, actor, requestId, mode);
  for (let guard = 0; guard < 20; guard++) {
    s = await readRequest(db, actor, requestId);
    const step = s.intakeStep;
    if (!step) break;
    if (step === "sponsor") {
      const role = s.model.nodes.find((n) => n.type === "Role" && n.name === "Sponsor")!;
      await setSponsor(db, actor, requestId, role.id);
    } else if (OPTIONAL_STEPS.has(step) || step === "obligations") {
      await skipIntake(db, actor, requestId, step);
    } else {
      await recordIntake(db, actor, requestId, step, `Test ${step}`);
    }
  }
  s = await readRequest(db, actor, requestId);
  for (const item of s.coverage.filter((i) => i.state === null)) {
    await setCoverage(db, actor, requestId, item.nodeId, "addressed", "");
  }
}
