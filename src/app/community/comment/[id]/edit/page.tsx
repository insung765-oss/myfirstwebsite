'use client';

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";

interface Comment {
  id: number;
  content: string;
  post_id: number;
  user_id: string | null;
  password?: string | null;
}

export default function EditCommentPage() {
  const { id } = useParams(); // This is the comment ID
  const router = useRouter();
  const { user, session } = useAuth(); // session is needed for the token

  const [comment, setComment] = useState<Comment | null>(null);
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComment = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("community_comments")
        .select("id, content, post_id, user_id, password")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("댓글을 찾을 수 없거나 불러올 권한이 없습니다.");
        setLoading(false);
        return;
      }
      
      setComment(data);
      setContent(data.content);
      setLoading(false);
    };
    fetchComment();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!content.trim()) {
        setError("내용을 입력해주세요.");
        setIsSubmitting(false);
        return;
    }

    if (!comment?.user_id && !password.match(/^\d{4}$/)) {
        setError("익명 댓글을 수정하려면 4자리 비밀번호가 필요합니다.");
        setIsSubmitting(false);
        return;
    }

    try {
        const response = await supabase.functions.invoke('manage-post', {
            method: 'POST',
            headers: {
                ...user && { 'Authorization': `Bearer ${session?.access_token}` }
            },
            body: JSON.stringify({
                action: 'update',
                type: 'comment',
                id: comment?.id,
                payload: {
                    content,
                    ...(!comment?.user_id && { password })
                }
            })
        });

        if (response.error) throw new Error(response.error.message);
        const data = await response.data;
        if (data.error) throw new Error(data.error);

        alert('댓글이 성공적으로 수정되었습니다.');
        router.push(`/community/${comment?.post_id}`);
        router.refresh();

    } catch (err: any) {
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><div>로딩 중...</div></div>;
  if (error && !comment) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white">
        <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-100">
            <button onClick={() => router.back()} className="text-gray-600"><ArrowLeft size={24} /></button>
            <h1 className="font-bold text-lg">댓글 수정</h1>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {comment && !comment.user_id && (
                 <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <label htmlFor="password" className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                        <KeyRound size={14}/> 익명 댓글 비밀번호
                    </label>
                    <input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        maxLength={4} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        placeholder="작성 시 입력한 4자리 숫자"
                    />
                </div>
            )}
            
            <div>
                <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">내용</label>
                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition" />
            </div>

            {error && <p className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-md">{error}</p>}

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => router.back()} disabled={isSubmitting} className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50">취소</button>
              <button type="submit" disabled={isSubmitting || loading} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="animate-spin"/> : '수정 완료'}
              </button>
            </div>
        </form>
    </main>
  );
}
