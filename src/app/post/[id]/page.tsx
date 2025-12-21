import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CommentSection from "@/components/CommentSection";
import StarRating from "@/components/StarRating";

export const revalidate = 0;

// ✅ Next.js 15/16 필수 수정: params 타입을 Promise로 정의해야 합니다.
export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  
  // ✅ 핵심: params를 반드시 await으로 기다렸다가 까봐야 합니다!
  const { id } = await params;

  // 1. 가져온 id로 DB 조회
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    console.error("글 불러오기 실패:", error);
    return <div className="text-center py-20">글을 찾을 수 없습니다.</div>;
  }

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white pb-20">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <Link href="/" className="text-gray-600 hover:text-black transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg truncate flex-1">{post.title}</h1>
      </header>

      <div className="p-6">
        <section className="flex flex-col items-center text-center mb-8">
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-48 h-48 rounded-xl shadow-lg mb-6 object-cover"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{post.title}</h2>
          <p className="text-lg text-gray-600 mb-4">{post.artist}</p>
          
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full mb-6">
            <span className="text-xs font-bold text-gray-500 uppercase">Writer's Pick</span>
            {/* StarRating이 문제를 일으키지 않도록 안전하게 렌더링 */}
            <StarRating rating={post.rating || 0} />
            <span className="font-bold text-gray-800">{post.rating}</span>
          </div>

          <iframe
            style={{ borderRadius: "12px" }}
            src={`https://open.spotify.com/embed/track/${post.spotify_id}?utm_source=generator`}
            width="100%"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full border-none shadow-sm"
          ></iframe>
        </section>

        <section className="bg-indigo-50 p-6 rounded-2xl mb-8 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
             <User size={16} className="text-indigo-600"/>
             <span className="font-bold text-indigo-900">{post.user_name}</span>
          </div>
          <p className="text-indigo-900 leading-relaxed font-medium">
            "{post.comment}"
          </p>
        </section>

        <CommentSection postId={post.id} />
      </div>
    </main>
  );
}