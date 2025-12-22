'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ThumbsUp, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/utils/date";

// TypeScript 인터페이스를 정의하여 Post 객체의 타입을 명시합니다.
interface Post {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_name: string;
  upvotes: number;
  images?: string[];
}

export default function CommunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  // useState에 Post 타입 또는 null을 명시적으로 지정합니다.
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isVoted, setIsVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingVote, setIsProcessingVote] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);

      // 1. Fetch Post Details
      const { data: postData, error: postError } = await supabase
        .from("community_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (postError || !postData) {
        console.error("Error fetching post:", postError);
        setIsLoading(false);
        return;
      }
      setPost(postData);

      // 2. Check vote status ONLY if user is logged in
      if (user && user.name) {
        const { data: voteData } = await supabase
          .from("community_votes")
          .select("id")
          .eq("post_id", postData.id)
          .eq("user_name", user.name)
          .limit(1)
          .single();
        setIsVoted(!!voteData);
      } else {
        setIsVoted(false); // Ensure isVoted is false for logged-out users
      }

      // 3. Fetch Comments
      const { data: commentData } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      setComments(commentData || []);

      setIsLoading(false);
    };

    fetchData();
  }, [id, user]); // Re-fetch when user logs in/out

  const handleRecommend = async () => {
    if (isProcessingVote || !id) return;
    if (!user || !user.name) {
      alert("비로그인 상태에서는 추천을 할 수 없습니다. 😢");
      return;
    }
    if (isVoted) {
      alert("이미 추천한 게시글입니다. 😉");
      return;
    }

    setIsProcessingVote(true);

    try {
      const { error: updateError } = await supabase.rpc('increment_upvotes', { post_id_arg: id });
      if (updateError) throw updateError;

      const { error: voteError } = await supabase.from("community_votes").insert({
        post_id: id,
        user_name: user.name,
        vote_type: 'up',
      });
      if (voteError) throw voteError;

      setPost((prevPost) => 
        prevPost ? { ...prevPost, upvotes: prevPost.upvotes + 1 } : prevPost
      );
      setIsVoted(true);

    } catch (error) {
      console.error("Error during recommendation:", error);
      alert("추천 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingVote(false);
    }
  };

  const submitComment = async () => {
    if (!commentInput.trim() || !id) return;
    const authorName = user && user.name ? user.name : "익명";

    const { error } = await supabase.from("community_comments").insert({
      post_id: id,
      content: commentInput,
      user_name: authorName,
    });

    if (!error) {
      setCommentInput("");
      const { data: commentData } = await supabase.from("community_comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
      setComments(commentData || []);
    } else {
      alert("댓글 작성 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) return <div className="p-10 text-center">로딩 중...</div>;
  if (!post) return <div className="p-10 text-center">게시글을 찾을 수 없습니다.</div>;

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
            disabled={isVoted || isProcessingVote}
            className={`flex flex-col items-center gap-1 px-8 py-3 rounded-xl transition-colors ${isVoted ? 'bg-gray-200 text-gray-400' : 'bg-red-50 text-red-600 hover:bg-red-100'} disabled:opacity-70 disabled:cursor-not-allowed`}
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
                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-gray-700 text-sm">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* 댓글 입력창을 원래 위치로 복원하고, 너비 문제를 해결했습니다. */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 남겨보세요"
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 min-w-0"
            />
            <button 
              onClick={submitComment}
              className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
