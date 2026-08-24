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