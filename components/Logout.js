"use client"

import { supabase } from "@/lib/supabase";

export default function Logout() {
    return(
        <div>
            <button onClick={() => supabase.auth.signOut()}>
                LogOut
            </button>
        </div>
    );
}