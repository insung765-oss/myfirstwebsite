import Link from "next/link";
import { ThumbsUp, ThumbsDown, Image as ImageIcon, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/utils/date";
import Header from "@/components/Header";

export const revalidate = 0;

export default async function CommunityPage() {
  // 커뮤니티 글 불러오기
  const { data: posts } = await supabase
    .from("community_posts")
    .select("*, community_comments(count)")
    .order("created_at", { ascending: false });

  const displayPosts = posts || [];

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-gray-50 pb-20">
      <Header />
      {/* 게시글 리스트 */}
      <div className="p-4 space-y-4">
        {displayPosts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>아직 게시글이 없어요.</p>
            <p className="text-sm mt-2">첫 번째 글을 남겨보세요!</p>
          </div>
        ) : (
          displayPosts.map((post) => {
            const commentCount = post.community_comments?.[0]?.count ?? 0;

            return (
              <Link href={`/community/${post.id}`} key={post.id} className="block">
                <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer">
                  {/* 상단 정보: 제목, 작성일 */}
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 break-all">{post.title}</h2>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  {/* 본문 내용 */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {post.content}
                  </p>

                  {/* 이미지 썸네일 */}
                  {post.images && post.images.length > 0 && (
                    <div className="mt-4 mb-4 relative">
                      <img 
                        src={post.images[0]} 
                        alt={`${post.title} 썸네일`} 
                        className="w-full h-48 object-cover rounded-lg bg-gray-100"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <ImageIcon size={14} />
                        <span>{post.images.length}</span>
                      </div>
                    </div>
                  )}

                  {/* 하단 정보: 작성자, 추천 수, 비추천 수, 댓글 수 */}
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">{post.user_name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {commentCount > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          <span className="font-semibold">{commentCount}</span>
                        </div>
                      )}
                      {post.upvotes > 0 && (
                        <div className="flex items-center gap-1 text-red-500">
                          <ThumbsUp size={14} />
                          <span className="font-semibold">{post.upvotes}</span>
                        </div>
                      )}
                      {post.downvotes > 0 && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <ThumbsDown size={14} />
                          <span className="font-semibold">{post.downvotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}