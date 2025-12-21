"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Image as ImageIcon, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CommunityWritePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false); // 업로드 중 표시

  // 1. 이미지 파일 선택 및 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const file = e.target.files[0];
    
    // 파일 이름 중복 방지를 위해 시간 + 랜덤숫자 조합
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from("images") // 아까 만든 버킷 이름
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 업로드된 파일의 공개 주소(URL) 가져오기
      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      // 이미지 목록에 추가
      setImages([...images, data.publicUrl]);

    } catch (error) {
      console.error(error);
      alert("이미지 업로드에 실패했습니다 ㅠㅠ");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return alert("로그인이 필요합니다!");
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해주세요.");

    const { error } = await supabase.from("community_posts").insert({
      title,
      content,
      user_name: user.name,
      images: images,
    });

    if (!error) {
      router.push("/community");
      router.refresh();
    } else {
      alert("작성 실패");
    }
  };

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white pb-20">
      <header className="p-4 flex items-center gap-4 border-b border-gray-100">
        <Link href="/community" className="text-gray-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg">새 글 쓰기</h1>
      </header>

      <div className="p-6 space-y-6">
        <input
          type="text"
          placeholder="제목"
          className="w-full text-xl font-bold outline-none placeholder:text-gray-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <textarea
          placeholder="자유롭게 이야기해보세요."
          className="w-full h-48 outline-none resize-none text-gray-700 leading-relaxed placeholder:text-gray-300"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* 이미지 첨부 영역 */}
        <div className="space-y-3">
          <label 
            htmlFor="image-upload" 
            className={`block w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <div className="flex justify-center items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" /> 업로드 중...
              </div>
            ) : (
              <div className="flex justify-center items-center gap-2 text-gray-500 font-bold">
                <ImageIcon size={20} />
                <span>갤러리에서 사진 선택하기</span>
              </div>
            )}
            <input 
              id="image-upload" 
              type="file" 
              accept="image/*" // 이미지 파일만 허용
              onChange={handleImageUpload}
              className="hidden" 
              disabled={isUploading}
            />
          </label>

          {/* 추가된 이미지 미리보기 */}
          {images.length > 0 && (
             <div className="flex gap-2 overflow-x-auto py-2">
               {images.map((url, idx) => (
                 <div key={idx} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                   <img src={url} alt="" className="w-full h-full object-cover" />
                   <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                   >
                     <X size={12} />
                   </button>
                 </div>
               ))}
             </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-700 transition disabled:bg-gray-300"
        >
          등록하기
        </button>
      </div>
    </main>
  );
}