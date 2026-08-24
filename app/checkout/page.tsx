'use client';

import { useCartStore } from "@/lib/cart-store";
import { useState } from "react";
import type { SubmitEvent } from "react";

const CheckoutPage = () => {
    const items = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [orderId, setOrderId] = useState("");

    const total = items.reduce((sum, item) => sum + (item.price) * (item.quantity), 0);

    const handleSubmit = async(event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch('/api/orders', {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    items: items.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            const body = await response.json();

            if (!response.ok) {
                setError(body.error ?? "สร้างออเดอร์ไม่สำเร็จ");
                return;
            }

            setOrderId(body.orderId);
            clearCart();
        } catch {
            setError("ไม่สามารถเชื่อมต่อ server ได้")
        } finally {
            setLoading(false);
        }
    }

    if (orderId) {
        return (
            <div>
                <h1>สร้างออเดอร์สำเร็จ</h1>
                <p>Order ID: {orderId}</p>
            </div>
        )
    }

  return (
    <form onSubmit={handleSubmit}>
        <h1>ยืนยันคำสั่งซื้อ</h1>
        <p>จำนวนสินค้า : {items.length}</p>
        <p>ยอดรวม : {total} บาท</p>

        {error && (
            <p className="text-red-700">
                {error}
            </p>
        )}

        <button type="submit" disabled={loading || items.length === 0} className="cursor-pointer">
            {loading ? "กำลังสร้างออเดอร์..." : "ยืนยันคำสั่งซื้อ"}
        </button>
    </form>
  )
}
export default CheckoutPage