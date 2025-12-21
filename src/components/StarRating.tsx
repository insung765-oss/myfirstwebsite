"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface Props {
  rating: number;
  editable?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, editable = false, onChange }: Props) {
  const [hover, setHover] = useState(0);

  // 별 하나를 렌더링하는 함수
  const renderStar = (index: number) => {
    const starValue = index; // 1, 2, 3, 4, 5

    // 현재 표시해야 할 점수 (호버 중이면 호버 점수, 아니면 고정 점수)
    const currentRating = editable && hover > 0 ? hover : rating;
    
    // 꽉 찬 별 조건
    const isFull = currentRating >= starValue;
    // 반 개 별 조건 (예: 3.5점일 때 4번째 별은 반 개여야 함)
    const isHalf = !isFull && currentRating >= starValue - 0.5;

    return (
      <div
        key={index}
        className={`relative ${editable ? "cursor-pointer" : "cursor-default"}`}
        onMouseMove={(e) => {
          if (!editable || !onChange) return;
          // 마우스가 별의 왼쪽 절반에 있으면 -0.5, 오른쪽이면 정수
          const { left, width } = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - left) / width;
          const newValue = percent < 0.5 ? starValue - 0.5 : starValue;
          setHover(newValue);
        }}
        onClick={() => {
          if (editable && onChange) onChange(hover);
        }}
        onMouseLeave={() => editable && setHover(0)}
      >
        {/* 별 모양 (빈 별, 반 별, 꽉 찬 별 교체) */}
        {isFull ? (
          <Star className="text-yellow-400 fill-yellow-400" size={24} />
        ) : isHalf ? (
          // Lucide에는 StarHalf가 있지만 왼쪽 절반만 채우기 위해 스타일 조정
          <div className="relative">
            <Star className="text-gray-300" size={24} />
            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
               <Star className="text-yellow-400 fill-yellow-400" size={24} />
            </div>
          </div>
        ) : (
          <Star className="text-gray-300" size={24} />
        )}
      </div>
    );
  };

  return <div className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => renderStar(i))}</div>;
}