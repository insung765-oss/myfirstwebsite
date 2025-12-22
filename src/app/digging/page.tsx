import Link from "next/link";
import { PlusCircle, Music, Star, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { PostAnalytics } from "@/types";

// 데이터 캐싱 끄기 (새로고침 할 때마다 최신 글 가져오기)
export const revalidate = 0;

export default async function Home() {
  // 1. Supabase에서 데이터 가져오기 (최신순 정렬)
  const { data: posts, error } = await supabase
    .from("post_analytics")
    .select("*")
    .order("created_at", { ascending: false });

  // 에러가 나면 콘솔에 띄우고 빈 배열로 처리
  if (error) {
    console.error("데이터 불러오기 실패:", error);
  }

  const displayPosts = posts || [];

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-gray-50 pb-20">
      <Header />

      {/* 게시글 리스트 */}
      <div className="p-4 space-y-4">
        {displayPosts.length === 0 ? (
          // 게시글이 없을 때 안내 문구
          <div className="text-center py-20 text-gray-500">
            <p>아직 등록된 노래가 없어요.</p>
            <p className="text-sm mt-2">첫 번째 추천곡을 올려보세요! 🎵</p>
          </div>
        ) : (
          displayPosts.map((post) => (
            <Link href={`/post/${post.id}`} key={post.id} className="block">
              <article
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 상단 정보 영역 */}
                <div className="p-4 flex gap-4">
                  {/* 앨범 커버 */}
                  <div className="relative shrink-0">
                    <img
                      src={post.cover_url} // DB 컬럼명 확인 (cover_url)
                      alt={post.title}
                      className="w-24 h-24 rounded-md object-cover shadow-sm border border-gray-100"
                    />
                  </div>

                  {/* 곡 정보 및 평점 */}
                  <div className="flex-1 flex justify-between">
                    <div className="flex flex-col justify-center min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 leading-tight pr-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 font-medium">
                        {post.artist}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        {" "}
                        <span className="text-gray-600 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                          {post.user_name}
                        </span>
                      </p>
                    </div>

                    {/* 점수 표시 (RYM 스타일) */}
                    <div className="flex flex-col items-end justify-center shrink-0 min-w-[70px]">
                      {/* 1. 평균 점수 (소수점 2자리) */}
                      <div className="text-3xl font-extrabold text-indigo-600">
                        {post.average_rating ? post.average_rating.toFixed(2) : "0.00"}
                      </div>
                      
                      {/* 2. 총 별점 수 (작성자 + 댓글) */}
                      <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                        <Star size={12} className="fill-gray-400 text-gray-400" />
                        {post.total_count} ratings
                      </div>
                    </div>
                  </div>
                </div>

                {/* 코멘트 영역 */}
                <div className="px-4 pb-4">
                  <div className="bg-gray-50 p-3 rounded-md text-gray-700 text-sm italic border-l-4 border-indigo-200">
                    "{post.comment}"
                  </div>
                </div>

                {/* 스포티파이 플레이어 */}
                <div className="px-4 pb-4">
                  <iframe
                    style={{ borderRadius: "8px" }}
                    src={`https://open.spotify.com/embed/track/${post.spotify_id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="80"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="border-none bg-gray-100"
                  ></iframe>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}