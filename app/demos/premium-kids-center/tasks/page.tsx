import type { Metadata } from "next";
import { BembiTasksPage } from "../BembiInternalPages";
import { BEMBI_DEMO_BASE_PATH } from "../PlatformShell";
export const metadata: Metadata = { title: "Практические задания | BEMBI", description: "Демонстрационная библиотека printable-заданий BEMBI по математике, чтению, логике и творчеству.", alternates: { canonical: "/demos/premium-kids-center/tasks" } };
export default function TasksPage(){return <BembiTasksPage basePath={BEMBI_DEMO_BASE_PATH} demo />}
