import AddToCartBtn from "@/components/addToCartBtn";
import { supabase } from "@/lib/supabase";



const ProductIdPage = async({ params }:{ params: Promise<{ id : string  }>}) => {
   const { id } = await params;
   const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();

   if (error || !product) {
    return (
        <div>
            <div>
                <h1>ไม่พบสินค้า</h1>
            </div> 
        </div>
    )
   }

  return (
    <div>
        <div>
            <h1>{product.name_product}</h1>
            <h1>{product.stock === 0 ? ( <span>หมด</span> ) : ( <span>เหลือ {product.stock} ชิ้น</span> )}</h1>
            <h1>{product.price} บาท</h1>
        </div>
        <div>
           
           <AddToCartBtn product={{id: product.id, name_product: product.name_product, price: product.price, stock: product.stock}}/>

        </div>
    </div>
  )
}
export default ProductIdPage