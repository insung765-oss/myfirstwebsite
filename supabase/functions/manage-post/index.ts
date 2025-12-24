import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, table, id, payload } = await req.json(); // 💡 `type`을 `table`로 변경하여 클라이언트와 일치시킴

    if (!["posts", "comments"].includes(table) || !["update", "delete", "can_edit"].includes(action) || !id) {
      throw new Error("Invalid request parameters.");
    }

    const { data: item, error: fetchError } = await supabaseAdmin
      .from(table)
      .select("user_id, password")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!item) throw new Error("Item not found.");

    let authorized = false;
    const authHeader = req.headers.get("Authorization");

    if (item.user_id) {
      if (!authHeader) throw new Error("Missing auth header for user-owned item.");
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user && user.id === item.user_id) {
        authorized = true;
      }
    } else if (item.password) {
      if (!payload.password) throw new Error("Password is required for anonymous item.");
      if (payload.password === item.password) {
        authorized = true;
      }
    }

    if (!authorized) {
      // 비밀번호 불일치 시, 401 Unauthorized 에러를 명시적으로 반환
      return new Response(JSON.stringify({ success: false, message: "비밀번호가 일치하지 않습니다." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // 💡 비밀번호 확인 액션 추가
    if (action === "can_edit") {
        return new Response(JSON.stringify({ success: true, message: "Authorized." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update") {
      const { content, rating } = payload;

      let updateData: any;
      if (table === 'posts') { 
          const { title, images } = payload;
          if (!title || !content) throw new Error("Title and content are required for post.");
          updateData = { title, content, images: images !== undefined ? images : [] };
      } else { // table === 'comments'
          if (content === undefined || rating === undefined) throw new Error("Content and rating are required for comment.");
          // 💡 누락되었던 rating 업데이트 로직 추가
          updateData = { content, rating }; 
      }

      const { error: updateError } = await supabaseAdmin.from(table).update(updateData).eq("id", id);
      if (updateError) throw updateError;
      return new Response(JSON.stringify({ success: true, message: "Successfully updated!" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete") {
      const { error: deleteError } = await supabaseAdmin.from(table).delete().eq("id", id);
      if (deleteError) throw deleteError;
      return new Response(JSON.stringify({ success: true, message: "Successfully deleted!" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
