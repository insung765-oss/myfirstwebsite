import Link from "next/link";
import { ArrowLeft, User, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CommentSection from "@/components/CommentSection";
import { formatDate } from "@/utils/date";

export const revalidate = 0;

// ✅ Next.js 15/16 필수 수정: params 타입을 Promise로 정의해야 합니다.
export default async function PostDetail({ params }: { params: Promise<{ id:string }> }) {
  
  // ✅ 핵심: params를 반드시 await으로 기다렸다가 까봐야 합니다!
  const { id } = await params;

  // 1. posts 테이블에서 기본 정보 조회 (작성자 별점 포함)
  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  // 2. post_analytics 뷰에서 통계 데이터 조회
  const { data: analyticsData, error: analyticsError } = await supabase
    .from("post_analytics")
    .select("average_rating, total_count")
    .eq("id", id)
    .single();

  if (postError || !postData) {
    console.error("글 불러오기 실패:", postError);
    return <div className="text-center py-20">글을 찾을 수 없습니다.</div>;
  }

  // 3. 두 데이터 병합
  const post = {
    ...postData,
    average_rating: analyticsData?.average_rating || 0,
    total_count: analyticsData?.total_count || 0,
  };

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white pb-20">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <Link href="/digging" className="text-gray-600 hover:text-black transition">
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
          <p className="text-lg text-gray-600 mb-0">{post.artist}</p>

          {/* 평점 및 참여자 수 (수평 디자인 수정) */}
          <div className="flex justify-center items-center gap-6 my-6">
            {/* 평균 평점 */}
            <div className="text-5xl font-extrabold text-indigo-600">
              {(post.average_rating || 0).toFixed(2)}
            </div>
            {/* 참여자 수 */}
            <div className="flex items-center gap-1 text-xl font-medium text-gray-500">
              <Star size={12} className="fill-gray-400 text-gray-400" />
              <span>{post.total_count || 0} ratings</span>
            </div>
          </div>
          
          <iframe
            style={{ borderRadius: "12px" }}
            src={`https://open.spotify.com/embed/track/${post.spotify_id}?utm_source=generator`}
            width="100%"
            height="80"
            allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full border-none shadow-sm"
          ></iframe>
        </section>

        {/* 작성자 코멘트 섹션 (디자인 수정) */}
        <section className="bg-indigo-50 p-6 rounded-2xl mb-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-indigo-900">{post.user_name}</span>
            <div className="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded-full text-xs font-bold text-indigo-700">
              <Star size={12} className="fill-indigo-500 text-indigo-500" />
              <span>{(post.rating || 0).toFixed(1)}</span>
            </div>
          </div>

          <p className="text-indigo-900 leading-relaxed font-medium my-3">
            "{post.comment}"
          </p>

          <p className="text-xs text-indigo-400 text-left">
            {formatDate(post.created_at)}
          </p>
        </section>

        <CommentSection postId={post.id} />
      </div>
    </main>
  );
}
