import {
  POST as analyticsPost,
} from "../analytics/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return analyticsPost(request);
}
