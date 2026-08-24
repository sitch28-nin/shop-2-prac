'use client';
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation";

const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async() => {    
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error(error.message);
            return;
        }

        router.push('/login');
        router.refresh();
    };


  return (
    <div>
        <button onClick={handleLogout} className="cursor-pointer">Logout</button>
    </div>
  )
}
export default LogoutButton