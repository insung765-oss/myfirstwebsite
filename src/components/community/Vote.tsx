'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ThumbsUp } from 'lucide-react'; // 아이콘 변경

interface VoteProps {
  postId: number;
  initialScore: number;
}

export default function Vote({ postId, initialScore }: VoteProps) {
  const [score, setScore] = useState(initialScore);
  const [userRecommended, setUserRecommended] = useState<boolean | null>(null);
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      const checkUserVote = async () => {
        const { data, error } = await supabase
          .from('community_post_votes')
          .select('value')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        if (data) {
          setUserRecommended(data.value === 1);
        } else {
          setUserRecommended(null);
        }
      };
      checkUserVote();
    }
  }, [isLoggedIn, postId, user]);

  const handleVote = async () => {
    if (!isLoggedIn) {
      alert('추천하려면 로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const voteValue = userRecommended ? 0 : 1; // 0은 추천 취소, 1은 추천
    const scoreChange = userRecommended ? -1 : 1;
    const newScore = score + scoreChange;

    const { error } = await supabase
      .from('community_post_votes')
      .upsert({ post_id: postId, user_id: user.id, value: voteValue }, { onConflict: 'post_id, user_id' });

    if (error) {
      console.error('Error voting:', error);
    } else {
      setScore(newScore);
      setUserRecommended(voteValue === 1);

      const { error: updateError } = await supabase
        .from('community_posts')
        .update({ score: newScore })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating post score:', updateError);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleVote}
        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg transition-colors text-sm font-semibold ${
          userRecommended
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {/* 아이콘을 ThumbsUp으로 변경하고, 추천 시 채워지도록 fill 속성 추가 */}
        <ThumbsUp size={16} fill={userRecommended ? 'currentColor' : 'none'} />
        <span>추천</span>
      </button>
      <span className="font-bold text-lg text-gray-800 w-8 text-center">{score}</span>
    </div>
  );
}
