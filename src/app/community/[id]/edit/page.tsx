'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, KeyRound, Loader2, Image as ImageIcon, X } from "lucide-react";

// The Post interface should expect an array of strings for images
interface Post {
  id: number;
  title: string;
  content: string;
  user_id: string | null;
  images: string[]; // Correct type: array of strings
  password?: string | null;
}

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // State for the images array, same as in write/page.tsx
  const [images, setImages] = useState<string[]>([]);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("community_posts")
        // Select the correct `images` array column
        .select("id, title, content, user_id, password, images")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("게시글을 찾을 수 없거나 불러올 권한이 없습니다.");
        setLoading(false);
        return;
      }

      if (data.user_id && data.user_id !== user?.id) {
        setError("이 게시글을 수정할 권한이 없습니다.");
        setLoading(false);
        return;
      }
      
      setPost(data);
      setTitle(data.title);
      setContent(data.content);
      // Set the initial state for the `images` array
      setImages(data.images || []);
      setLoading(false);
    };

    if (!authLoading) {
      fetchPost();
    }
  }, [id, user, authLoading]);

  // Image handling functions from write/page.tsx
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      setImages([...images, data.publicUrl]);
    } catch (error) {
      console.error(error);
      setError("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (urlToRemove: string) => {
    // Remove from state
    setImages(images.filter((url) => url !== urlToRemove));
    
    // Also remove from Supabase storage
    try {
        const fileName = urlToRemove.split('/').pop();
        if (fileName) {
            await supabase.storage.from('images').remove([fileName]);
        }
    } catch (err) {
        console.error("Failed to delete image from storage:", err);
        // Note: We don't re-add to the UI state to avoid complexity, 
        // but we log the error.
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!post?.user_id && !password.match(/^\d{4}$/)) {
      setError("익명 글을 수정하려면 4자리 비밀번호가 필요합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke('manage-post', {
        method: 'POST',
        headers: {
          ...(user && { 'Authorization': `Bearer ${session?.access_token}` })
        },
        body: JSON.stringify({
          action: 'update',
          type: 'post',
          id: post?.id,
          payload: {
            title,
            content,
            images: images, // Send the full `images` array
            ...(!post?.user_id && { password })
          }
        })
      });

      if (response.error) throw new Error(response.error.message);
      const data = await response.data;
      if (data?.error) throw new Error(data.error);

      alert('게시글이 성공적으로 수정되었습니다.');
      router.push(`/community/${id}`);
      router.refresh();

    } catch (err: any) {
      setError(err.message || '수정 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || loading) return <div className="flex justify-center items-center h-screen"><div>로딩 중...</div></div>;
  if (error && !post) return <div className="p-4 text-red-500 text-center">{error}</div>;
  if (!post) return <div className="p-4 text-center">게시글을 찾을 수 없습니다.</div>

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-600"><ArrowLeft size={24} /></button>
        <h1 className="font-bold text-lg">게시글 수정</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {post && !post.user_id && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <label htmlFor="password" className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2"><KeyRound size={14}/> 익명 글 비밀번호</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="작성 시 입력한 4자리 숫자" />
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">제목</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">내용</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        
        {/* Image handling UI from write/page.tsx */}
        <div className="space-y-3">
          <label htmlFor="image-upload" className={`block w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition ${isUploading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isUploading ? (
              <div className="flex justify-center items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> 업로드 중...</div>
            ) : (
              <div className="flex justify-center items-center gap-2 text-gray-500 font-bold"><ImageIcon size={20} /><span>갤러리에서 사진 추가하기</span></div>
            )}
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading || isSubmitting}/>
          </label>

          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`첨부 이미지 ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(url)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-md">{error}</p>}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.back()} disabled={isSubmitting} className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">취소</button>
          <button type="submit" disabled={isSubmitting || isUploading} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-sm disabled:bg-gray-400">
            {isSubmitting ? <Loader2 className="animate-spin"/> : '수정 완료'}
          </button>
        </div>
      </form>
    </main>
  );
}
