
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import LogoutButton from "./LogoutButton";

const Navbar = async() => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  return (
    <nav className="flex justify-between px-10 py-2 border-b">
        <div>
            <Link href={'/'}>SHOP2</Link>
        </div>
        <div>
            <div className="flex gap-2">
                <Link href={'/products'}>Products</Link>
                <Link href={'/cart'}>Cart</Link>
                <Link href={'/checkout'}>Checkout</Link>
                {user ? (
                    <div className="flex gap-2">
                        <div>
                            <Link href={'/account'}>{user.email}</Link>
                        </div>
                        <div>
                            <LogoutButton/>
                        </div>
                    </div>
                        
                ) : (
                    <div className="flex gap-2">
                        <Link href={'/login'}>Login</Link>
                        <Link href={'/signup'}>Signup</Link>
                    </div>
                )}
            </div>
        </div>
    </nav>
  )
}
export default Navbar