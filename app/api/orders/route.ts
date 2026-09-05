import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export const POST = async(request: NextRequest) => {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
            { error : "ต้องมีสินค้าอย่างน้อย 1 รายการ"},
            { status: 400 }
        );
    }

    const requestedQuantities = new Map<string, number>();

    for (const item of items) {
        if (
            typeof item?.productId !== 'string' ||
            item.productId.trim().length === 0 ||
            !Number.isInteger(item?.quantity) ||
            item.quantity <= 0
        ) {
            return NextResponse.json(
                { error: "ข้อมูลสินค้าไม่ถูกต้อง" },
                { status: 400 }
            )
        }

        const productId = item.productId.trim();

        requestedQuantities.set(
            productId,
            (requestedQuantities.get(productId) ?? 0) + item.quantity
        );
    }
    
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "กรุณาเข้าสู่ระบบ" },
            { status: 401 }
        );
    }

    const normalizedItems = Array.from(
        requestedQuantities,
        ([productId, quantity]) => ({
            productId,
            quantity,
        })
    );

    const { data: orderId, error } = await supabase.rpc('create_order_atomic', { p_items: normalizedItems, });

    if (error) {
        console.error(error);

        if (error.message.includes("INSUFFICIENT_STOCK")) {
            return NextResponse.json(
                { error: "สินค้าไม่เพียงพอ" },
                { status: 409 }
            )
        }

        if (error.message.includes("PRODUCT_NOT_FOUND")) {
            return NextResponse.json(
                { error: "ไม่พบสินค้า" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "ไม่สามารถสร้างออเดอร์ได้" },
            { status: 500 }
        );
    }

    return NextResponse.json(
        {
            message: "สร้างออเดอร์สำเร็จ",
            orderId,
        },
        { status: 201 }
    );
};

export const GET = async() => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "กรุณาเข้าสู่ระบบ" },
            { status: 401 }
        );
    }
    
    const { data: orders, error} = await supabase.from('orders').select(`id, status, total, created_at, order_items (id, product_id, quantity, price_at_purchase)`).eq('user_id',  user.id).order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return NextResponse.json(
            { error: "ไม่สามารถอ่านประวัติคำสั่งซื้อได้" },
            { status: 500 }
        )
    }

    return NextResponse.json({ orders });
}