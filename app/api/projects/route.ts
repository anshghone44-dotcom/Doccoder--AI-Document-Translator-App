export async function GET() {
    const token = process.env.VERCEL_TOKEN;

    if (!token) {
        return Response.json(
            { error: "VERCEL_TOKEN is not configured" },
            { status: 401 }
        );
    }

    try {
        const response = await fetch("https://api.vercel.com/v2/projects", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return Response.json(
                { error: errorData.error?.message || "Failed to fetch projects from Vercel" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error("Error fetching Vercel projects:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
