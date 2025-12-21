import Link from "next/link";
import { PlusCircle, MessageSquare, ThumbsUp, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function CommunityPage() {
  // 커뮤니티 글 불러오기
  const { data: posts } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const displayPosts = posts || [];

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-10">
        <h1 className="font-bold text-lg text-gray-800">커뮤니티 💬</h1>
        <Link href="/community/write">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-purple-700 transition shadow-md">
            <PlusCircle size={16} />
            글쓰기
          </button>
        </Link>
      </header>

      {/* 게시글 리스트 */}
      <div className="p-4 space-y-4">
        {displayPosts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>아직 게시글이 없어요.</p>
            <p className="text-sm mt-2">첫 번째 글을 남겨보세요!</p>
          </div>
        ) : (
          displayPosts.map((post) => (
            <Link href={`/community/${post.id}`} key={post.id} className="block">
              <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{post.title}</h2>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                  {post.content}
                </p>

                {/* 하단 정보 (작성자, 이미지 유무, 추천 수) */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">{post.user_name}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* 이미지가 있으면 아이콘 표시 */}
                    {post.images && post.images.length > 0 && (
                      <div className="flex items-center gap-1 text-purple-500">
                        <ImageIcon size={14} />
                        <span>{post.images.length}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      {post.upvotes}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}