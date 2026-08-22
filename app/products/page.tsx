import { supabase } from "@/lib/supabase"
import Link from "next/link";

const ProductPage = async() => {
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) {
        return (
            <div>
                <div>
                    <h1>เกิดข้อผิดพลาดในการโหลดสินค้า</h1>
                </div>
            </div>
        )
    }

  return (
    <div>
        <div>
            {products.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                    <li>
                        <p>{product.name_product} {product.stock === 0 ? ( <span>หมด</span> ) : ( <span>เหลือ {product.stock} ชิ้น</span> )} {product.price} บาท</p>
                    </li>
                </Link>
            ))}
        </div>
    </div>
  )
}
export default ProductPage