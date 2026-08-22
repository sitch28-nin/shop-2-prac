'use client';

import { useCartStore } from "@/lib/cart-store"

const AddToCartBtn = ({product}:{product: {id: string, name_product: string, stock: number, price: number}}) => {
    const addItem = useCartStore((state) => state.addItem);

    const handleClick = () => {
        addItem(product);
    }

  return (
    <div>

        <button onClick={handleClick} className="cursor-pointer">เพิ่มสินค้า</button>

    </div>
  )
}
export default AddToCartBtn