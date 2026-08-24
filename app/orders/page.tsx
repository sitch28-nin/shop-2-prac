'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = {
    id: number;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
}

type Order = {
    id: string;
    status: string;
    total: number | string;
    created_at: string;
    order_items: OrderItem[];
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrders = async() => {
            try {
                const response = await fetch("/api/orders", {
                    credentials: "include"
                });

                const body = await response.json();

                if (!response.ok) {
                    setError(body.error ?? "โหลดข้อมูลไม่สำเร็จ");
                    return;
                }
                
                setOrders(body.orders);
            } catch {
                setError("ไม่สามารถเชื่อมต่อ server ได้");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [])

    if (loading) {
        return <p>กำลังโหลด...</p>
    }

    if (error) {
        return <p>{error}</p>
    }
  return (
    <div>
        <h1>ประวัติคำสั่งซื้อ</h1>

        {orders.length === 0 ? (
            <p>ยังไม่มีคำสั่งซื้อ</p>
        ) : (
            orders.map((order) => (
                <div key={order.id}>
                    <p>Order ID: {order.id}</p>
                    <p>สถานะ: {order.status}</p>
                    <p>ยอดรวม: {Number(order.total).toLocaleString()} บาท</p>
                    <p>จำนวนสินค้า: {order.order_items.length} รายการ</p>
                    <Link href={`/orders/${order.id}`}>ดูรายละเอียด</Link>
                </div>
            ))
        )}
    </div>
  )
}
export default OrdersPage