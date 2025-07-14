import { currentUser } from "@clerk/nextjs/server";
import ClientNavbar from "./ClientNavbar";
import { syncUser } from "@/app/actions/user.action";

export default async function Navbar() {
  const user = await currentUser();
  if (user) await syncUser();

  return (
    <div className="w-full">
      <ClientNavbar />
    </div>
  );
}
