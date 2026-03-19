import { requireAuth } from "../utils/auth.ts";

export async function handleGetMe(request: Request): Promise<Response> {
  try {
    const account = await requireAuth(request.headers);

    return Response.json({
      id: account.id,
      username: account.username,
      discord: account.discord,
      createdAt: account.created_at,
    });
  } catch (error) {
    return Response.json(
      { error: (error as Error).message || "Unauthorized" },
      { status: 401 }
    );
  }
}
