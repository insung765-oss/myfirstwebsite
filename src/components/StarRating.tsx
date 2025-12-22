"use client";

import { Star } from "lucide-react";
import { useState, MouseEvent, TouchEvent } from "react";

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
    
    const isFull = currentRating >= starValue;
    const isHalf = !isFull && currentRating >= starValue - 0.5;

    // Helper to calculate rating from pointer position within the star element
    const calculateRating = (clientX: number, target: HTMLElement): number => {
        const { left, width } = target.getBoundingClientRect();
        const percent = (clientX - left) / width;
        const newValue = percent < 0.5 ? starValue - 0.5 : starValue;
        return newValue;
    };

    // --- Event Handlers ---

    // Handles mouse moving over a star
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!editable) return;
        setHover(calculateRating(e.clientX, e.currentTarget));
    };

    // Handles finger moving over a star on a touch device
    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (!editable) return;
        setHover(calculateRating(e.touches[0].clientX, e.currentTarget));
    };

    // Resets hover state when mouse leaves the star area
    const handleMouseLeave = () => {
        if (!editable) return;
        setHover(0);
    };

    // Handles the final rating selection on click or touch end
    const handleSelect = (clientX: number, target: HTMLElement) => {
        if (!editable || !onChange) return;
        const finalRating = calculateRating(clientX, target);
        onChange(finalRating);
        setHover(0); // Reset hover after selection
    };

    // Wrapper for mouse click for non-touch devices
    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (typeof window !== "undefined" && "ontouchstart" in window) return;
        handleSelect(e.clientX, e.currentTarget);
    };
    
    // Wrapper for touch end
    const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent ghost click
        handleSelect(e.changedTouches[0].clientX, e.currentTarget);
    };

    return (
      <div
        key={index}
        className={`relative ${editable ? "cursor-pointer" : "cursor-default"}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd} // This is key for mobile tap
        onClick={handleClick}      // Fallback for desktop click
      >
        {isFull ? (
          <Star className="text-yellow-400 fill-yellow-400" size={24} />
        ) : isHalf ? (
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
