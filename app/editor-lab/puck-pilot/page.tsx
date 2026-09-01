import PuckPilotEditor from "@/components/puck-site-editor/pilot-editor";
import { createPuckPilotFixture } from "@/lib/puck-site-editor/pilot-fixture";

export default function PuckPilotFixturePage() {
  return (
    <PuckPilotEditor
      businessId="local-pilot-fixture"
      locale="en"
      initialDocument={createPuckPilotFixture("en")}
      publicPreviewHref="/editor-lab/puck-pilot/public"
    />
  );
}
