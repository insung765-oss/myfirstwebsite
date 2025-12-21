"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StarRating from "@/components/StarRating";
import { User, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/date"; // 👈 날짜 포맷 함수 불러오기

interface Comment {
  id: string;
  user_name: string;
  content: string;
  rating: number;
  created_at: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. 댓글 불러오기
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true }); // 👈 오래된 순으로 변경
    if (data) setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 2. 댓글 작성하기
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return alert("내용을 입력해주세요.");
    if (rating === 0) return alert("별점을 남겨주세요.");

    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      content,
      rating,
      user_name: user.name,
    });

    if (error) {
      alert("오류가 발생했습니다.");
    } else {
      setContent("");
      setRating(0);
      fetchComments(); // 목록 새로고침
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
        유저 리뷰 <span className="text-indigo-600">{comments.length}</span>
      </h3>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl mb-8">
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">My Rating</label>
          <div className="flex items-center gap-2">
            <StarRating rating={rating} editable={true} onChange={setRating} />
            <span className="font-bold text-gray-700">{rating > 0 ? rating.toFixed(1) : "0.0"}</span>
          </div>
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="이 노래에 대한 내 생각은?"
          className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
          rows={3}
        />
        
        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg text-sm hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "등록 중..." : "리뷰 남기기"}
        </button>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <User size={16} className="text-gray-500" />
            </div>
            <div className="flex-1 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-gray-900">{comment.user_name}</span>
                <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700">
                  <Star size={10} className="fill-yellow-600 text-yellow-600" />
                  {comment.rating}
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {/* ✅ 날짜 포맷 적용 */}
                {formatDate(comment.created_at)}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">첫 번째 리뷰를 남겨보세요!</p>
        )}
      </div>
    </div>
  );
}