'use client';

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";

type OrderItem = {
    id: string;
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

const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState("");
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const loadOrder = async() => {
            const response = await fetch(`/api/orders/${id}`, {
                credentials: "include",
            });

            const body = await response.json();

            if (!response.ok) {
                setError(body.error ?? "โหลดออเดอร์ไม่สำเร็จ");
                return;
            }

            setOrder(body.order);
        };

        if (id) {
            loadOrder();
        }
    }, [id]);

    if (error) return <p>{error}</p>;
    if  (!order) return <p>กำลังโหลด...</p>;

    const handlepay = async () => {
        if (paying || order.status !== "pending") return;
        
        setPaying(true);
        setError("");

        try {
            const response = await fetch(`/api/orders/${order.id}`, {
            method: "POST",
            credentials: "include"
            })

            const body = await response.json();
            if (!response.ok) {
                setError(body.error ?? "ไม่สามารถชำระเงินได้");
                return;
            }

            setOrder((currentOrder) => 
                currentOrder
                    ? {...currentOrder, ...body.order}
                    : body.order
            );
        } catch {
            setError("ไม่สามารถเชื่อมต่อ server ได้");
        } finally {
            setPaying(false);
        }
    };

  return (
    <div>
        <h1>รายละเอียดคำสั่งซื้อ</h1>
        <p>Order ID: {order.id}</p>
        <p>สถานะ: {order.status}</p>
        <p>ยอดรวม: {Number(order.total).toLocaleString()} บาท</p>

        {order.order_items.map((item) => (
            <div key={item.id}>
                <p>สินค้า: {item.product_id}</p>
                <p>จำนวน: {item.quantity}</p>
                <p>ราคาตอนซื้อ: {item.price_at_purchase} บาท</p>
            </div>
        ))}

        <div>
            {order.status === "pending" && (
                <button onClick={handlepay} className="cursor-pointer" disabled={paying}>
                    {paying ? " กำลังชำระเงิน..." : "ชำระเงิน"}
                </button>
            )}
        </div>
    </div>
  )
}
export default OrderDetailPage