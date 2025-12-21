"use client";

import Link from "next/link";
import { ArrowLeft, Search, X, Loader2, Music } from "lucide-react";
import { useState } from "react";
import StarRating from "@/components/StarRating";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// 검색 결과 데이터 타입 정의
interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
}

export default function WritePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // 1. 노래 검색 함수
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      alert("노래를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 노래 선택 함수
  const selectTrack = (track: Track) => {
    setSelectedTrack(track);
    setResults([]);
    setKeyword("");
  };

  // 3. 다시 검색하기 (선택 취소)
  const removeTrack = () => {
    setSelectedTrack(null);
  };

  // 4. 최종 저장 (DB 연결)
  const handleSubmit = async () => {
    if (!selectedTrack) return alert("노래를 선택해주세요!");
    if (rating === 0) return alert("별점을 매겨주세요!");

    try {
      setIsLoading(true);

      const { error } = await supabase.from("posts").insert({
        title: selectedTrack.title,
        artist: selectedTrack.artist,
        cover_url: selectedTrack.coverUrl,
        spotify_id: selectedTrack.id,
        rating: rating,
        comment: comment,
        user_name: user.name,
      });

      if (error) throw error;

      try {
        const res = await fetch("/api/spotify/add-track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId: selectedTrack.id }),
        });
  
        if (!res.ok) {
          console.warn("스포티파이 플리 추가 실패 (하지만 DB엔 저장됨)");
        }
      } catch (spotifyError) {
        console.error("Spotify add error:", spotifyError);
        // 플리 추가 실패해도 글은 써진 것이므로 굳이 에러창을 띄우진 않음 (선택사항)
      }
      
      alert("저장되었습니다! 🎉");
      router.push("/digging");
      router.refresh();

    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <header className="p-4 flex items-center gap-4 border-b border-gray-100">
        <Link href="/digging" className="text-gray-600 hover:text-black">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg">노래 추천하기</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* === 섹션 1: 노래 검색 및 선택 === */}
        <section>
          <label className="block font-bold text-gray-800 mb-2">어떤 노래인가요?</label>
          
          {selectedTrack ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between animate-fade-in-up">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTrack.coverUrl}
                  alt={selectedTrack.title}
                  className="w-16 h-16 rounded-md shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-indigo-900">{selectedTrack.title}</h3>
                  <p className="text-sm text-indigo-600">{selectedTrack.artist}</p>
                </div>
              </div>
              <button 
                onClick={removeTrack}
                className="p-2 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="제목이나 가수를 검색하세요"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-12 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="absolute right-2 top-2 p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18}/> : <ArrowLeft size={18} className="rotate-180"/>}
                </button>
              </form>

              {results.length > 0 && (
                <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden divide-y divide-gray-50">
                  {results.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(track)}
                      className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <img src={track.coverUrl} alt="" className="w-10 h-10 rounded bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{track.title}</p>
                        <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {results.length === 0 && !isLoading && keyword.length > 1 && (
                 <p className="text-xs text-gray-400 mt-2 ml-1">엔터를 눌러 검색하세요</p>
              )}
            </div>
          )}
        </section>

        {/* === 섹션 2: 별점 === */}
        <section>
          <label className="block font-bold text-gray-800 mb-2">이 노래, 몇 점인가요?</label>
          <div className="flex items-center gap-4">
            <StarRating rating={rating} editable onChange={setRating} />
            <span className="text-2xl font-bold text-gray-800">{rating > 0 ? rating.toFixed(1) : "0.0"}</span>
          </div>
        </section>

        {/* === 섹션 3: 코멘트 === */}
        <section>
          <label className="block font-bold text-gray-800 mb-2">친구들에게 한마디</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="이 노래를 추천하는 이유나 감상평을 남겨주세요."
            rows={5}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          ></textarea>
        </section>

        {/* 완료 버튼 */}
        <button 
          onClick={handleSubmit}
          className={`w-full font-bold py-4 rounded-xl text-lg shadow-lg transition
            ${selectedTrack && rating > 0 
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          작성 완료
        </button>
      </div>
    </main>
  );
}