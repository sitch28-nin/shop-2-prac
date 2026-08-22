'use client';

import { useCartStore } from "@/lib/cart-store"

const CartPage = () => {
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const increaseItem = useCartStore((state) => state.increaseItem);
    const decreaseItem = useCartStore((state) => state.decreaseItem);

    const total = items.reduce((sum, item) => sum + (item.quantity) * (item.price) ,0);
    const itemCount = items.reduce((sum, item) => sum + (item.quantity) , 0);

    if (items.length === 0) {
        return (
            <div>
                <div>
                    <h1>ตะกร้าว่าง</h1>
                </div>
            </div>
        )
    };

  return (
    <div>
        <div>
            {items.map((item) => {
                const isAtStockLimit = item.quantity >= item.stock;
                return (
                    <div key={item.id}>
                        <div>
                            <h2>{item.name_product}</h2>
                            <p>ราคาต่อชิ้น {item.price.toLocaleString()} บาท</p>
                            <button onClick={() => increaseItem(item.id)} disabled={isAtStockLimit}>
                                {isAtStockLimit ? "ถึงจำนวนสูงสุดแล้ว" : "+"}
                            </button>
                            <p>จำนวน {item.quantity} ชิ้น</p>
                            <button onClick={() => decreaseItem(item.id)}>
                                -
                            </button> <br />
                            <button onClick={() => removeItem(item.id)}>
                                ลบ
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
        <div>
            <h2>จำนวนทั้งหมด {itemCount} ชิ้น</h2>
            <h2>ราคาทั้งหมด {total} บาท</h2>
            <button onClick={() => clearCart()}>ล้างตะกร้า</button>
        </div>
    </div>
  )
}
export default CartPage