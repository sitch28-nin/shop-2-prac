'use client'

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEvent } from "react";


const SignupPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async( event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) {
            setError("เกิดข้อผิดพลาด:" + error.message);
            setLoading(false);
            return;
        }

        router.push('/login');
    }

  return (
    <div>
        <form onSubmit={handleSignUp}>
            <input 
            type="email" 
            placeholder="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input 
            type="password" 
            placeholder="password"
            value={password}
            required
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button type="submit" disabled={loading}>
                {loading ? "กำลังดำเนินการ..." : "Signup"}
            </button>
        </form>
        { error && (
            <p className="text-red-700">{error}</p>
        )}
    </div>
  )
}
export default SignupPage