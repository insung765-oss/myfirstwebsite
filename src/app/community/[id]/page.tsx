'use client';

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/utils/date"; // formatDate 임포트
import { ArrowLeft, ThumbsUp, Send, Edit, Trash2, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";

// 타입 정의
interface Post {
  id: number;
  title: string;
  content: string;
  user_name: string;
  user_id: string | null;
  created_at: string;
  upvotes: number;
  images: string[];
  password?: string | null;
}

interface Comment {
  id: number;
  post_id: number;
  user_name: string;
  user_id: string | null;
  content: string;
  created_at: string;
  password?: string | null;
}

export default function CommunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, session } = useAuth();
  
  // 상태 관리
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // 입력 폼 상태
  const [newComment, setNewComment] = useState("");
  const [commentPassword, setCommentPassword] = useState("");
  
  // 추천 기능 상태
  const [isVoted, setIsVoted] = useState(false);
  const [isProcessingVote, setIsProcessingVote] = useState(false);

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentError, setCommentError] = useState("");

  // --- 데이터 불러오기 ---
  const fetchPostAndComments = async () => {
    if (!id) return;
    setLoading(true);

    // 1. 게시글 조회
    const { data: postData, error: postError } = await supabase
      .from("community_posts")
      .select("*, user_id, password")
      .eq("id", id)
      .single();

    if (postError || !postData) {
      console.error("Error fetching post:", postError);
      setLoading(false);
      return;
    }
    setPost(postData);

    // 2. 추천 여부 확인
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
      setIsVoted(false);
    }

    // 3. 댓글 조회
    const { data: commentsData } = await supabase
      .from("community_comments")
      .select("*, user_id, password")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    setComments(commentsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [id, user]);

  // --- 권한 확인 헬퍼 함수 ---
  const canEditOrDelete = (itemUserId: string | null): boolean => {
    if (!user) return itemUserId === null;
    return itemUserId === user.id || itemUserId === null;
  };

  // --- 추천 기능 핸들러 ---
  const handleRecommend = async () => {
    if (isProcessingVote || !id || !post) return;
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

      setPost(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : prev);
      setIsVoted(true);

    } catch (error) {
      console.error("Error during recommendation:", error);
      alert("추천 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingVote(false);
    }
  };

  // --- 댓글 작성 핸들러 ---
  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCommentError("");

    if (!newComment.trim() || !post) return;

    let commentData: any;

    if (user) {
      commentData = {
        post_id: post.id,
        content: newComment,
        user_id: user.id,
        user_name: user.name,
        password: null,
      };
    } else {
      if (!commentPassword.match(/^\d{4}$/)) {
        setCommentError("수정/삭제에 사용할 4자리 비밀번호를 입력해주세요.");
        return;
      }
      commentData = {
        post_id: post.id,
        content: newComment,
        user_id: null,
        user_name: "익명",
        password: commentPassword,
      };
    }

    const { data, error: insertError } = await supabase
      .from("community_comments")
      .insert(commentData)
      .select();

    if (insertError) {
      setCommentError("댓글 작성에 실패했습니다.");
    } else if (data) {
      setComments([...comments, data[0]]);
      setNewComment("");
      setCommentPassword("");
    }
  };

  // --- 삭제/관리 공통 함수 ---
  const callManageFunction = async (type: 'post' | 'comment', action: 'delete', itemId: number, password?: string) => {
    setIsDeleting(true);
    try {
        const response = await supabase.functions.invoke('manage-post', {
            method: 'POST',
            headers: { ...user && { 'Authorization': `Bearer ${session?.access_token}` } },
            body: JSON.stringify({
                action,
                type,
                id: itemId,
                payload: { ...password && { password } }
            })
        });

        if (response.error) throw new Error(response.error.message);
        const data = await response.data;
        if (data.error) throw new Error(data.error);
        return data;

    } catch (err: any) {
        alert(`오류: ${err.message}`);
    } finally {
        setIsDeleting(false);
    }
  }

  // --- 게시글 삭제 핸들러 ---
  const handleDeletePost = async () => {
    if (!post) return;
    const isAnonymous = !post.user_id;
    let password = '';

    if (isAnonymous) {
        password = prompt("게시글을 삭제하려면 4자리 비밀번호를 입력하세요.") || '';
        if (!password.match(/^\d{4}$/)) {
            alert('비밀번호 형식이 올바르지 않습니다.');
            return;
        }
    }
    
    if(confirm(`정말로 이 게시글을 삭제하시겠습니까?`)) {
        const result = await callManageFunction('post', 'delete', post.id, isAnonymous ? password : undefined);
        if (result) {
            alert('게시글이 삭제되었습니다.');
            router.push('/community');
            router.refresh();
        }
    }
  };

  // --- 댓글 삭제 핸들러 ---
  const handleDeleteComment = async (comment: Comment) => {
    const isAnonymous = !comment.user_id;
    let password = '';

    if (isAnonymous) {
        password = prompt("댓글을 삭제하려면 4자리 비밀번호를 입력하세요.") || '';
        if (!password.match(/^\d{4}$/)) {
            alert('비밀번호 형식이 올바르지 않습니다.');
            return;
        }
    }

    if(confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
        const result = await callManageFunction('comment', 'delete', comment.id, isAnonymous ? password : undefined);
        if (result) {
            fetchPostAndComments();
        }
    }
  }

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-purple-600" /></div>;
  if (!post) return <div className="p-10 text-center">게시글을 찾을 수 없습니다.</div>;

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white">
      {/* 헤더 */}
      <header className="p-4 pl-16 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-20 border-b border-gray-100">
        <Link href="/community" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg truncate flex-1">커뮤니티</h1>
        
        {/* 게시글 관리 버튼 */}
        {canEditOrDelete(post.user_id) && (
          <div className="flex items-center gap-1">
             <Link href={`/community/${post.id}/edit`} className="text-gray-400 hover:text-blue-600 p-2">
                 <Edit size={20} />
             </Link>
             <button onClick={handleDeletePost} disabled={isDeleting} className="text-gray-400 hover:text-red-600 p-2">
                 {isDeleting ? <Loader2 className="animate-spin" size={20}/> : <Trash2 size={20} />}
             </button>
          </div>
        )}
      </header>

      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
          <span className={`font-bold ${post.user_id ? 'text-blue-600' : 'text-gray-700'}`}>
            {post.user_name}
          </span>
          <span>{formatDate(post.created_at, 'long')}</span>
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

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg group relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${comment.user_id ? 'text-blue-600' : 'text-gray-800'}`}>
                        {comment.user_name}
                    </span>
                    <span className="text-xs text-gray-400">
                        {formatDate(comment.created_at, 'long')}
                    </span>
                  </div>
                  
                  {/* 여기 수정/삭제 버튼 추가됨 */}
                  {canEditOrDelete(comment.user_id) && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                            href={`/community/comment/${comment.id}/edit`} 
                            className="text-gray-300 hover:text-blue-500 p-1"
                            title="댓글 수정"
                        >
                            <Edit size={14} />
                        </Link>
                        <button 
                            onClick={() => handleDeleteComment(comment)} 
                            className="text-gray-300 hover:text-red-500 p-1"
                            title="댓글 삭제"
                        >
                            <Trash2 size={14} />
                        </button>
                      </div>
                  )}
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-2">
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
              {!user && (
                  <div className="flex items-center gap-2 px-1">
                      <KeyRound size={14} className="text-gray-400"/>
                      <input
                          type="password"
                          value={commentPassword}
                          onChange={(e) => setCommentPassword(e.target.value)}
                          placeholder="비밀번호(4자리)"
                          maxLength={4}
                          className="text-xs border-b border-gray-200 p-1 focus:border-purple-500 outline-none w-24 transition-colors"
                      />
                      <span className="text-[10px] text-gray-400"></span>
                  </div>
              )}
              
              <div className="flex gap-2 w-full max-w-full">
                  <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "댓글을 남겨보세요" : "내용을 입력해주세요"}
                  className="flex-1 min-w-0 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                  />
                  <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition flex-shrink-0 shadow-md disabled:bg-gray-300"
                  >
                  <Send size={18} />
                  </button>
              </div>
              {commentError && <p className="text-red-500 text-xs px-2">{commentError}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}