'use client';

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEvent } from "react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async( event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setError("เกิดข้อผิดพลาด: " + error.message);
            setLoading(false);
            return;
        }

        router.push('/');
        router.refresh();
    }

  return (
    <div>
        <form onSubmit={handleLogin}>
            <input 
            type="email"
            placeholder="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
             />
            <input 
            type="password"
            placeholder="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit" disabled={loading}>
                {loading ? "กำลังดำเนินการ" : "Login"}
            </button>
        </form>
        { error && (
            <p className="text-red-700">{error}</p>
        )}
    </div>
  )
}
export default LoginPage