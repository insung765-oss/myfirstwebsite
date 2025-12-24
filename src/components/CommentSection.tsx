'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StarRating from "@/components/StarRating";
import { User, Star, KeyRound, Pen, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/utils/date";

interface Comment {
  id: string;
  user_name: string;
  content: string;
  rating: number;
  created_at: string;
  user_id: string | null;
}

function PasswordModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (password: string) => void; }) {
  const [password, setPassword] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 space-y-4 animate-fade-in-up">
        <h3 className="font-bold text-lg">비밀번호 확인</h3>
        <p className="text-sm text-gray-600">댓글 작성 시 입력한 4자리 비밀번호를 입력하세요.</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={4} className="w-full border border-gray-300 rounded-md p-2" autoFocus />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100">취소</button>
          <button onClick={() => { onSubmit(password); setPassword(''); }} className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700">확인</button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, user, onAction, onUpdate, unlockedComment, onAnonymousUpdate }: { comment: Comment; user: any; onAction: (type: 'edit' | 'delete', commentId: string) => void; onUpdate: (commentId: string, content: string, rating: number) => void; unlockedComment: { id: string; password: string } | null; onAnonymousUpdate: (args: any) => void; }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editRating, setEditRating] = useState(comment.rating);

  const isOwner = user && user.id === comment.user_id;
  const isAnonymous = !comment.user_id;
  const isUnlocked = unlockedComment?.id === comment.id;

  useEffect(() => {
    if (isUnlocked) {
      setIsEditing(true);
    }
  }, [isUnlocked]);

  const handleUpdate = () => {
    if (isOwner) {
      onUpdate(comment.id, editContent, editRating);
    } else if (isUnlocked) {
      onAnonymousUpdate({ commentId: comment.id, content: editContent, rating: editRating, password: unlockedComment.password });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setEditRating(comment.rating);
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0"><User size={16} className="text-gray-500" /></div>
      <div className="flex-1">
         <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{comment.user_name}</span>
                     {(isOwner || isAnonymous) && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => isOwner || isUnlocked ? setIsEditing(prev => !prev) : onAction('edit', comment.id)} className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition"><Pen size={14} /></button>
                            <button onClick={() => onAction('delete', comment.id)} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition"><Trash2 size={14} /></button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700"><Star size={10} className="fill-yellow-600 text-yellow-600" />{comment.rating}</div>
            </div>
            {isEditing ? (
                <div className="space-y-2 mt-2">
                    <StarRating rating={editRating} editable={true} onChange={setEditRating} />
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" />
                    <div className="flex justify-end gap-2">
                        <button onClick={handleCancel} className="text-xs font-medium text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100">취소</button>
                        <button onClick={handleUpdate} className="text-xs font-medium text-white bg-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-700">저장</button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(comment.created_at)}</p>
                </>
            )}
         </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
  const [unlockedComment, setUnlockedComment] = useState<{ id: string; password: string } | null>(null);

  const fetchComments = async () => {
    const { data } = await supabase.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    if (data) setComments(data);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || rating === 0) return alert('내용과 별점을 모두 입력해주세요.');
    if (!user && !password.match(/^\d{4}$/)) return alert('익명 댓글은 4자리 비밀번호가 필요합니다.');

    setLoading(true);
    const { error } = await supabase.from("comments").insert({ post_id: postId, content, rating, user_id: user ? user.id : null, user_name: user ? user.name : '익명', password: user ? null : password });
    if (error) alert(`오류 발생: ${error.message}`);
    else { setContent(''); setRating(0); setPassword(''); fetchComments(); }
    setLoading(false);
  };

  const handleCommentAction = (type: 'edit' | 'delete', commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    const isOwner = user && user.id === comment.user_id;

    if (isOwner) {
      if (type === 'delete') {
        if (confirm('정말 삭제하시겠습니까?')) handleDeleteLoggedIn(commentId);
      }
    } else {
      setSelectedComment(comment);
      setActionType(type);
      setIsModalOpen(true);
    }
  };
  
  const handleDeleteLoggedIn = async (commentId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) alert(`삭제 실패: ${error.message}`);
    else fetchComments();
  };

  const handleUpdateLoggedIn = async (commentId: string, content: string, rating: number) => {
    const { error } = await supabase.from('comments').update({ content, rating }).eq('id', commentId);
    if (error) alert(`수정 실패: ${error.message}`);
    else fetchComments();
  }

  // 💡 잘못된 Edge Function 호출을 원래의 RPC 호출 방식으로 복구합니다.
  const handlePasswordSubmit = async (password: string) => {
    if (!selectedComment || !actionType) return;
    setIsModalOpen(false);

    if (actionType === 'delete') {
      const { data, error } = await supabase.rpc('delete_anonymous_comment', { 
        comment_id: selectedComment.id, 
        check_password: password 
      });
      if (error) return alert(`오류: ${error.message}`);
      if (data === '삭제 성공') { 
        alert('삭제되었습니다.'); 
        fetchComments(); 
      } else {
        alert(data);
      }
    } else if (actionType === 'edit') {
        const { data, error } = await supabase.rpc('can_edit_anonymous_content', { 
          content_id: selectedComment.id, 
          table_name: 'comments', 
          check_password: password 
        });
        if (error) return alert(`오류: ${error.message}`);
        if (data) {
            setUnlockedComment({ id: selectedComment.id, password: password });
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    }

    setSelectedComment(null);
    setActionType(null);
  };

  // 💡 존재하지 않는 함수를 호출하던 부분을, 새로 만들 함수의 이름으로 선언합니다.
  const handleAnonymousUpdate = async ({ commentId, content, rating, password }: { commentId: string, content: string, rating: number, password: string }) => {
    const { data, error } = await supabase.rpc('update_anonymous_comment', { 
      p_comment_id: commentId, 
      p_check_password: password, 
      p_new_content: content, 
      p_new_rating: rating 
    });
    
    if (error) {
      alert(`수정 실패: ${error.message}`);
    } else if (data === '수정 성공') {
      alert('수정되었습니다.');
      fetchComments();
    } else {
      alert(data);
    }
    setUnlockedComment(null);
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <PasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handlePasswordSubmit} />
      <h3 className="font-bold text-lg text-gray-900 mb-6">유저 리뷰 <span className="text-indigo-600">{comments.length}</span></h3>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl mb-8 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">My Rating</label>
          <div className="flex items-center gap-2"><StarRating rating={rating} editable={true} onChange={setRating} /><span className="font-bold text-gray-700">{rating > 0 ? rating.toFixed(1) : "0.0"}</span></div>
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={user ? `${user.name}님, 이 노래에 대한 생각은?` : '익명으로 리뷰를 남겨보세요...'} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
        {!user && (
          <div>
            <label htmlFor="comment-password" className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><KeyRound size={12}/> 비밀번호 (4자리 숫자)</label>
            <input id="comment-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={4} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm"/>
          </div>
        )}
        <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg text-sm hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">{loading ? "등록 중..." : "리뷰 남기기"}</button>
      </form>
      <div className="space-y-6">
        {comments.map((comment) => (<CommentItem key={comment.id} comment={comment} user={user} onAction={handleCommentAction} onUpdate={handleUpdateLoggedIn} unlockedComment={unlockedComment} onAnonymousUpdate={handleAnonymousUpdate} />))}
        {comments.length === 0 && <p className="text-center text-gray-400 text-sm py-4">첫 번째 리뷰를 남겨보세요!</p>}
      </div>
    </div>
  );
}
