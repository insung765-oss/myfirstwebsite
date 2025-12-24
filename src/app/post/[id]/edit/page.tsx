'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams, notFound } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import StarRating from '@/components/StarRating';

interface Post {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  comment: string;
  rating: number;
  user_id: string | null;
}

function EditPageComponent({ postId }: { postId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [anonymousPassword, setAnonymousPassword] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const checkPermissionAndFetchData = async () => {
      const { data: postData } = await supabase.from('posts').select('*').eq('id', postId).single();
      if (!postData) {
        setLoading(false);
        return notFound();
      }

      const isOwner = user && user.id === postData.user_id;
      const anonPassword = searchParams.get('password');

      let canEdit = false;
      if (isOwner) {
        canEdit = true;
      } else if (anonPassword) {
        const { data: canEditAnon } = await supabase.rpc('can_edit_anonymous_content', { content_id: postId, table_name: 'posts', check_password: anonPassword });
        if (canEditAnon) {
            canEdit = true;
            setAnonymousPassword(anonPassword);
        }
      }

      if (canEdit) {
        setPost(postData);
        setRating(postData.rating);
        setComment(postData.comment);
        setHasPermission(true);
      } else {
        alert('수정 권한이 없습니다.');
        router.back();
      }
      setLoading(false);
    };

    // user 객체가 로딩될 때까지 기다립니다.
    if (user !== undefined) {
      checkPermissionAndFetchData();
    }
  }, [postId, user, router, searchParams]);

  const handleSubmit = async () => {
    if (rating === 0 || !post) return alert('별점을 매겨주세요!');
    setIsSubmitting(true);

    try {
        if (user && user.id === post.user_id) {
            const { error } = await supabase.from('posts').update({ rating, comment }).eq('id', post.id);
            if (error) throw new Error(error.message);
        } else if (anonymousPassword) {
            const { data, error } = await supabase.rpc('update_anonymous_post', { p_post_id: post.id, p_check_password: anonymousPassword, p_new_comment: comment, p_new_rating: rating });
            if (error) throw new Error(error.message);
            if (data !== '수정 성공') throw new Error(data);
        }
        alert('수정되었습니다.');
        router.push(`/post/${post.id}`);
        router.refresh(); // 페이지를 새로고침하여 변경사항을 즉시 반영합니다.
    } catch (error: any) {
        alert(`수정 실패: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || !hasPermission) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
  }
  if (!post) return notFound();

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white pb-20">
      <header className="p-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-black p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">게시글 수정</h1>
      </header>
      <div className="p-6 space-y-8">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
          <img src={post.cover_url} alt={post.title} className="w-16 h-16 rounded-md shadow-sm object-cover" />
          <div>
            <h3 className="font-bold text-gray-900">{post.title}</h3>
            <p className="text-sm text-gray-600">{post.artist}</p>
          </div>
        </div>
        <section>
          <label htmlFor='rating' className="block font-bold text-gray-800 mb-2">별점 수정</label>
          <div className="flex items-center gap-4">
              <StarRating id='rating' rating={rating} editable onChange={setRating} />
              <span className="text-2xl font-bold text-gray-800 w-16 text-center">{rating.toFixed(1)}</span>
          </div>
        </section>
        <section>
          <label htmlFor='comment' className="block font-bold text-gray-800 mb-2">코멘트 수정</label>
          <textarea id='comment' value={comment} onChange={(e) => setComment(e.target.value)} rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors" />
        </section>
        <button onClick={handleSubmit} disabled={isSubmitting || loading} className="w-full font-bold py-4 rounded-xl text-lg shadow-lg transition duration-300 ease-in-out bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center">
            {isSubmitting ? <Loader2 className="animate-spin"/> : '수정 완료'}
        </button>
      </div>
    </main>
  );
}

export default function EditPostPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>}>
      <EditPostPageLoader params={params} />
    </Suspense>
  );
}

function EditPostPageLoader({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  if (!id) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
  }

  return <EditPageComponent postId={id} />;
}