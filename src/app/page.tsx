import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("vendia_token")?.value;
  const role = cookieStore.get("vendia_role")?.value;

  if (token && role === "super_admin") {
    redirect("/overview");
  } else if (token) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
