import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";

const AccountPage = async() => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

  return (
    <main>
        <h1>Account</h1>
        <p>{user.email}</p>
    </main>
  )
}
export default AccountPage