'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Star, Pen, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import CommentSection from '@/components/CommentSection';
import { formatDate } from '@/utils/date';

// 💡 page.tsx 로부터 받을 데이터 타입
interface PostData {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  comment: string;
  rating: number;
  user_name: string;
  created_at: string;
  spotify_id: string;
  user_id: string | null; 
  average_rating: number;
  total_count: number; 
}

// 💡 비밀번호 확인 모달 (내부에서만 사용)
function PasswordModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (password: string) => void; }) {
  const [password, setPassword] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 space-y-4 animate-fade-in-up">
        <h3 className="font-bold text-lg">비밀번호 확인</h3>
        <p className="text-sm text-gray-600">작성 시 입력한 4자리 비밀번호를 입력하세요.</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={4} className="w-full border border-gray-300 rounded-md p-2" autoFocus />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100">취소</button>
          <button onClick={() => { onSubmit(password); setPassword(''); }} className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700">확인</button>
        </div>
      </div>
    </div>
  );
}

// 💡 메인 클라이언트 컴포넌트
export default function PostClient({ initialPost }: { initialPost: PostData }) {
  const { user } = useAuth();
  const router = useRouter();
  const [post] = useState<PostData>(initialPost);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);

  const handleAction = (type: 'edit' | 'delete') => {
    const isOwner = user && user.id === post.user_id;
    if (isOwner) {
      if (type === 'edit') router.push(`/post/${post.id}/edit`);
      else if (confirm('정말 삭제하시겠습니까?')) handleDeleteLoggedIn();
    } else { // 익명 글
      setActionType(type);
      setIsModalOpen(true);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    setIsModalOpen(false);

    if (actionType === 'edit') {
      const { data, error } = await supabase.rpc('can_edit_anonymous_content', { content_id: post.id, table_name: 'posts', check_password: password });
      if (error) return alert(`오류 발생: ${error.message}`);
      if (data) router.push(`/post/${post.id}/edit?password=${password}`);
      else alert('비밀번호가 일치하지 않습니다.');
    } else if (actionType === 'delete') {
      const { data, error } = await supabase.rpc('delete_anonymous_post', { post_id: post.id, check_password: password });
      if (error) return alert(`오류 발생: ${error.message}`);
      if (data === '삭제 성공') { alert('게시글이 삭제되었습니다.'); router.push('/digging'); router.refresh(); }
      else alert(data);
    }
    setActionType(null);
  };

  const handleDeleteLoggedIn = async () => {
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) alert(`삭제 실패: ${error.message}`);
    else { alert('삭제되었습니다.'); router.push('/digging'); router.refresh(); }
  };

  const isOwner = user && user.id === post.user_id;
  const isAnonymous = !post.user_id;

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white pb-20">
      <PasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handlePasswordSubmit} />
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <Link href="/digging" className="text-gray-600 hover:text-black transition"><ArrowLeft size={24} /></Link>
        <h1 className="font-bold text-lg truncate flex-1">{post.title}</h1>
      </header>
      <div className="p-6">
        <section className="flex flex-col items-center text-center mb-8">
          <img src={post.cover_url} alt={post.title} className="w-48 h-48 rounded-xl shadow-lg mb-6 object-cover" />
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{post.title}</h2>
          <p className="text-lg text-gray-600 mb-0">{post.artist}</p>
          <div className="flex justify-center items-center gap-6 my-6">
            <div className="text-5xl font-extrabold text-indigo-600">{(post.average_rating || 0).toFixed(2)}</div>
            <div className="flex items-center gap-1 text-xl font-medium text-gray-500"><Star size={12} className="fill-gray-400 text-gray-400" /><span>{post.total_count || 0} ratings</span></div>
          </div>
          <iframe style={{ borderRadius: "12px" }} src={`https://open.spotify.com/embed/track/${post.spotify_id}?utm_source=generator`} width="100%" height="80" allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="w-full border-none shadow-sm"></iframe>
        </section>
        <section className="bg-indigo-50 p-6 rounded-2xl mb-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-900">{post.user_name}</span>
              {(isOwner || isAnonymous) && (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAction('edit')} className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition"><Pen size={14} /></button>
                  <button onClick={() => handleAction('delete')} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded-full text-xs font-bold text-indigo-700"><Star size={12} className="fill-indigo-500 text-indigo-500" /><span>{(post.rating || 0).toFixed(1)}</span></div>
          </div>
          <p className="text-indigo-900 leading-relaxed font-medium my-3">"{post.comment}"</p>
          <p className="text-xs text-indigo-400 text-left">{formatDate(post.created_at)}</p>
        </section>
        <CommentSection postId={post.id} />
      </div>
    </main>
  );
}
