import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export const GET = async(request: NextRequest, { params }:{ params: Promise<{ id: string}> }) => {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "กรุณาเข้าสู่ระบบก่อน" },
            { status: 401 }
        );
    }

    const { data: order, error } = await supabase.from('orders').select(`id, status, total, created_at, order_items (id, product_id, quantity, price_at_purchase)`).eq('id', id).eq('user_id', user.id).single();

    if (error || !order) {
        return NextResponse.json(
            { error: "ไม่พบคำสั่งซื้อ" },
            { status: 404 }
        )
    }

    return NextResponse.json({ order });
}

export const POST = async(_request: NextRequest, {params}:{params: Promise<{id : string}>}) => {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "กรุณาเข้าสู่ระบบ"},
            { status: 401 }
        );
    }

    const { data: order, error: orderError} = await supabase.from('orders').select('id, status, total').eq('id', id).eq('user_id', user.id).single();

    if (orderError || !order) {
        return NextResponse.json(
            { error: "ไม่พบคำสั่งซื้อ"},
            { status: 404 }
        );
    }

    if (order.status !== "pending") {
        return NextResponse.json(
            { error: "ออเดอร์นี้ไม่สามารถชำระเงินได้" },
            { status: 409 }
        );
    }

    const { data: updateOrder, error: updateError } = await supabase.from('orders').update({ status: "paid", updated_at: new Date().toISOString(),}).eq('id', id).eq('user_id', user.id).eq('status', 'pending').select('id, status, total').single();

    if (updateError || !updateOrder) {
        console.error(updateError);
        return NextResponse.json(
            { error: "เปลี่ยนสถานะออเดอร์ไม่สำเร็จ" },
            { status: 500}
        );
    }

    return NextResponse.json({
        message: "ชำระเงินสำเร็จ",
        order: updateOrder,
    })
}