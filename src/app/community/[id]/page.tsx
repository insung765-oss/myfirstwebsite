'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ThumbsUp, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/utils/date";

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const fetchData = async () => {
    const { data: postData } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", id)
      .single();
    setPost(postData);

    const { data: commentData } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: true });
    setComments(commentData || []);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 수정된 추천 핸들러
  const handleRecommend = async () => {
    // 1. 비로그인 사용자 처리
    if (!user) {
      alert("비로그인 상태에서는 추천을 할 수 없습니다. 😢");
      return;
    }
    if (!post) return;

    // 2. 이미 추천했는지 확인 (게시물 ID와 사용자 이름으로)
    const { data: existingVote } = await supabase
      .from("community_votes")
      .select("id")
      .eq("post_id", id)
      .eq("user_name", user.name)
      .maybeSingle();

    // 3. 이미 추천한 경우 메시지 표시
    if (existingVote) {
      alert("이미 추천한 게시글입니다. 😉");
      return;
    }

    // 4. 추천 기록 및 게시글 추천 수 업데이트
    await supabase.from("community_votes").insert({
      post_id: id,
      user_name: user.name,
      vote_type: 'up',
    });

    const { error } = await supabase
      .from("community_posts")
      .update({ upvotes: post.upvotes + 1 })
      .eq("id", id);
    
    if (!error) fetchData();
  };

  const submitComment = async () => {
    if (!commentInput.trim()) return;

    const { error } = await supabase.from("community_comments").insert({
      post_id: id,
      content: commentInput,
      user_name: user.name,
    });

    if (!error) {
      setCommentInput("");
      fetchData();
    }
  };

  if (!post) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white pb-20">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-100">
        <Link href="/community" className="text-gray-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg truncate">커뮤니티</h1>
      </header>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
          <span className="font-bold">{post.user_name}</span>
          <span>{formatDate(post.created_at)}</span>
        </div>

        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-8 text-lg">
          {post.content}
        </p>

        {post.images && post.images.length > 0 && (
          <div className="space-y-4 mb-10">
            {post.images.map((url: string, idx: number) => (
              <img key={idx} src={url} alt="첨부 이미지" className="w-full rounded-xl border border-gray-100" />
            ))}
          </div>
        )}

        <div className="flex justify-center gap-4 mb-10">
          <button 
            onClick={handleRecommend}
            className="flex flex-col items-center gap-1 px-8 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
          >
            <ThumbsUp size={24} />
            <span className="font-bold">{post.upvotes}</span>
          </button>
        </div>

        <section className="border-t border-gray-100 pt-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            댓글 <span className="text-purple-600">{comments.length}</span>
          </h3>

          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">{comment.user_name}</span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{comment.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 남겨보세요"
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              onClick={submitComment}
              className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition"
            >
              <Send size={20} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
