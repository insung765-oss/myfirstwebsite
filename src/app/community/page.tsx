import Link from "next/link";
// ThumbsUp 아이콘을 사용합니다.
import { ThumbsUp, Image as ImageIcon, MessageCircle } from "lucide-react"; 
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/utils/date";
import Header from "@/components/Header";

export const revalidate = 0;

export default async function CommunityPage() {
  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("*, community_comments(count)") // 댓글 수를 함께 조회합니다.
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return <div>게시글을 불러오는 중 오류가 발생했습니다.</div>;
  }

  const displayPosts = posts || [];

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-gray-50 pb-20">
      <Header />
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
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 break-all">{post.title}</h2>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {post.content}
                  </p>

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

                  {/* 하단 정보: 작성자, 추천 수, 댓글 수 */}
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <span className="font-bold text-gray-700">{post.user_name}</span>
                    
                    <div className="flex items-center gap-4 text-sm">
                        {/* 추천 수 (0보다 클 때만 표시) - post.score를 post.upvotes로 수정했습니다. */}
                        {post.upvotes > 0 && (
                            <div className="flex items-center gap-1.5 text-red-500">
                                <ThumbsUp size={16} />
                                <span className="font-semibold">{post.upvotes}</span>
                            </div>
                        )}
                        {/* 댓글 수 */}
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <MessageCircle size={16} />
                            <span className="font-semibold">{commentCount}</span>
                        </div>
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
