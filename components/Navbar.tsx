import Link from "next/link"

const Navbar = () => {
  return (
    <nav className="flex justify-between px-10 py-2 border-b">
        <div>
            <Link href={'/'}>SHOP2</Link>
        </div>
        <div>
            <div className="flex gap-2">
                <Link href={'/products'}>Products</Link>
                <Link href={'/cart'}>Cart</Link>
                <Link href={'/'}>Checkout</Link>
            </div>
        </div>

    </nav>
  )
}
export default Navbar