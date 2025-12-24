'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Image as ImageIcon, X, Loader2, KeyRound } from "lucide-react";

export default function WritePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Post fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // Anonymous user fields
  const [password, setPassword] = useState("");

  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    setImages(images.filter((url) => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Validate common fields
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용은 반드시 입력해야 합니다.");
      return;
    }

    let postData: any;

    // 2. Handle based on user login status
    if (user) {
      // Logged-in user
      postData = {
        title,
        content,
        images,
        user_id: user.id,
        user_name: user.name,
        password: null,
      };
    } else {
      // Anonymous user validation
      if (!password.match(/^\d{4}$/)) {
        setError("수정/삭제에 사용할 4자리 숫자 비밀번호를 입력해주세요.");
        return;
      }
      postData = {
        title,
        content,
        images,
        user_id: null,
        user_name: "익명", // Hardcoded to '익명'
        password: password, 
      };
    }

    setIsSubmitting(true);

    // 3. Insert into database
    const { error: insertError } = await supabase.from("community_posts").insert([postData]);

    if (insertError) {
      console.error("Error creating post:", insertError);
      setError("게시글 작성 중 오류가 발생했습니다: " + insertError.message);
      setIsSubmitting(false);
    } else {
      alert("게시글이 성공적으로 작성되었습니다.");
      router.push("/community");
      router.refresh();
    }
  };

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white">
        <header className="p-4 flex items-center gap-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b border-gray-100">
            <button onClick={() => router.back()} className="text-gray-600"><ArrowLeft size={24} /></button>
            <h1 className="font-bold text-lg">새 게시물</h1>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Anonymous User Fields */}
            {!user && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  <p className="text-sm text-gray-600 font-semibold">익명으로 글 작성 (이름: '익명')</p>
                  <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><KeyRound size={14}/> 4자리 비밀번호</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="수정/삭제 시 필요합니다"/>
                  </div>
              </div>
            )}

            {/* Post Fields */}
            <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">제목</label>
                <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition" placeholder="무엇에 대해 이야기해볼까요?" />
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">내용</label>
                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition" placeholder="이곳에 내용을 입력하세요..." />
            </div>
            
            <div className="space-y-3">
                <label htmlFor="image-upload" className={`block w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition ${(isUploading || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploading ? (
                        <div className="flex justify-center items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> 업로드 중...</div>
                    ) : (
                        <div className="flex justify-center items-center gap-2 text-gray-500 font-bold"><ImageIcon size={20} /><span>갤러리에서 사진 선택하기</span></div>
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
              <button type="button" onClick={() => router.back()} disabled={isSubmitting} className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50">취소</button>
              <button type="submit" disabled={isUploading || isSubmitting} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="animate-spin"/> : '등록하기'}
              </button>
            </div>
        </form>
    </main>
  );
}
