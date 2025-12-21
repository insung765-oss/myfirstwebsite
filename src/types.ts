// src/types.ts
export interface PostAnalytics {
    id: string;
    user_name: string;
    artist: string;
    title: string;
    cover_url: string;
    spotify_id: string;
    rating: number;
    comment: string;
    created_at: string;
    average_rating: number; // 평균 평점 (예: 3.82)
    total_count: number;  // 총 평가/코멘트 수 (예: 1,402)
  }
