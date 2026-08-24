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

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
     
    if (!user) {
        return NextResponse.json(
            { error: "กรุณาเข้าสู่ระบบก่อน"},
            { status: 401 }
        )
    }

    if (!items.every(
        (item) =>
            typeof item?.productId === "string" &&
            item.productId.trim().length > 0 &&
            Number.isInteger(item?.quantity) &&
            item.quantity > 0
        )
    ) {
        return NextResponse.json(
            { error: "ข้อมูลสินค้าไม่ถูกต้อง" },
            { status: 400 }
        );
    }

    const productIds = [...new Set(items.map((item) => item.productId.trim())),];

    const { data: products, error: productsError } = await supabase.from('products').select('id, price, stock').in('id', productIds);

    if (productsError) {
        console.error(productsError);
        return NextResponse.json(
            { error: "ไม่สามารถอ่านข้อมูลสินค้าได้" },
            { status: 500 }
        );
    }

    if (!products || products.length !== productIds.length) {
        return NextResponse.json(
            { error: "มีสินค้าบางรายการไม่มีอยู่ในระบบ" },
            { status: 400 }
        )
    }

    const requestedQuantities = new Map<string, number>();

    for (const item of items) {
        const id = item.productId.trim();

        requestedQuantities.set(
            id,
            (requestedQuantities.get(id) ?? 0) + item.quantity
        );
    }

    for (const [productId, quantity] of requestedQuantities) {
        const product = products.find((product) => product.id === productId);

        if (!product) {
            return NextResponse.json(
                { error: "ไม่พบสินค้า" },
                { status: 400 }
            );
        }

        if (quantity > product.stock) {
            return NextResponse.json(
                { error: `สินค้า ${product.id} มี stock ไม่เพียงพอ` },
                { status: 400 }
            );
        }
    }

    const total = items.reduce((sum, item) => {
        const product = products.find((product) => product.id === item.productId.trim());
        return sum + Number(product!.price) * item.quantity;
    }, 0)

    const { data: order, error: orderError} = await supabase.from('orders').insert({ user_id: user.id, total, status: "pending", }).select('id').single();

    if (orderError) {
        return NextResponse.json(
            { error: "ออเดอร์ไม่ถูกต้อง" },
            { status: 500 }
        )
    }

    const orderItems = Array.from(requestedQuantities, ([productId, quantity]) => {
        const product = products.find((product) => product.id === productId)!;
        return {
            order_id: order.id,
            product_id: product.id,
            quantity,
            price_at_purchase: Number(product.price),
        };
    });

    const { error: orderItemError } = await supabase.from('order_items').insert(orderItems);

    if (orderItemError) {
        console.error(orderItemError);
        return NextResponse.json(
            { error : "ไม่สามารถบันทึกรายการสินค้าได้" },
            { status : 500 }
        );
    }

    for (const [productId, quantity] of requestedQuantities) {
        const { data: stockUpdated, error: stockError} = await supabase.rpc("decrement_stock", {p_product_id: productId, p_quantity: quantity});

        if (stockError || !stockUpdated) {
            console.error(stockError);

            return NextResponse.json(
                { error: "สินค้าไม่เพียงพอหรือไม่สามารถหัก stock ได้" },
                { status: 409 }
            );
        }
    }

    return NextResponse.json({
        message: "สร้างออเดอร์สำเร็จ",
        orderId: order.id,
        total,
    },
        { status: 201 }
    );
}

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