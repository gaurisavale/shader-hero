// Temporary in-memory storage
let users: { name: string; email: string }[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    // Validation
    if (!name || !email) {
      return Response.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    // Save user
    users.push({ name, email });

    console.log("Saved users:", users);

    return Response.json({
      message: "Form submitted & saved 🚀",
    });

  } catch (error) {
    return Response.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}