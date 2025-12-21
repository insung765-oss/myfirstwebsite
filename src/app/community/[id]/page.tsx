"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/utils/date"; // 👈 날짜 포맷 함수 불러오기

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const fetchData = async () => {
    // 1. 글 가져오기
    const { data: postData } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", id)
      .single();
    setPost(postData);

    // 2. 댓글 가져오기
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

  // ✅ 투표 핸들러 (하루 1회 제한)
  const handleVote = async (type: "upvotes" | "downvotes") => {
    if (!user) return alert("로그인해주세요!");
    if (!post) return;

    const voteTypeShort = type === "upvotes" ? "up" : "down";

    // 1. 오늘 이미 투표했는지 확인
    // (오늘 0시부터 현재까지 내 이름으로 된 투표가 있는지 조회)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 0시 0분 0초로 설정

    const { data: existingVote } = await supabase
      .from("community_votes")
      .select("*")
      .eq("post_id", id)
      .eq("user_name", user.name)
      .gte("created_at", today.toISOString()) // 오늘 날짜 이후인 것만
      .maybeSingle();

    if (existingVote) {
      return alert("투표는 하루에 한 번만 가능해요! 😅");
    }

    // 2. 투표 기록 남기기
    await supabase.from("community_votes").insert({
      post_id: id,
      user_name: user.name,
      vote_type: voteTypeShort,
    });

    // 3. 게시글 숫자 올리기
    const { error } = await supabase
      .from("community_posts")
      .update({ [type]: post[type] + 1 })
      .eq("id", id);
    
    if (!error) fetchData();
  };

  // 댓글 작성
  const submitComment = async () => {
    if (!user) return alert("로그인해주세요!");
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
          {/* ✅ 날짜 포맷 적용 */}
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
            onClick={() => handleVote("upvotes")}
            className="flex flex-col items-center gap-1 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
          >
            <ThumbsUp size={24} />
            <span className="font-bold">{post.upvotes}</span>
          </button>
          <button 
            onClick={() => handleVote("downvotes")}
            className="flex flex-col items-center gap-1 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
          >
            <ThumbsDown size={24} />
            <span className="font-bold">{post.downvotes}</span>
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
                  {/* ✅ 댓글 날짜도 포맷 적용 */}
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
              placeholder={user ? "댓글을 남겨보세요" : "로그인이 필요합니다"}
              disabled={!user}
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200"
            />
            <button 
              onClick={submitComment}
              disabled={!user}
              className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 disabled:bg-gray-300 transition"
            >
              <Send size={20} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}