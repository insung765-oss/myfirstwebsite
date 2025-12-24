import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import PostClient from './PostClient';

export const revalidate = 0;

// Next.js 15에서는 params도 Promise 타입입니다.
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. ⭐ 여기가 핵심 수정 사항입니다! await를 붙여주세요.
  const cookieStore = await cookies(); 
  
  // 2. params도 await로 풀어서 사용해야 안전합니다.
  const { id } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // 이제 cookieStore가 Promise가 아니라 진짜 객체이므로 .get이 작동합니다.
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {},
        remove(name: string, options: CookieOptions) {},
      },
    }
  );

  // 위에서 id를 이미 꺼냈으므로 여기는 지워도 되지만, 흐름상 둡니다.
  // const { id } = params; (위에서 await params 할 때 꺼냈으니 이 줄은 삭제)

  const { data: postData } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!postData) {
    notFound();
  }

  const { data: analyticsData } = await supabase
    .from('post_analytics')
    .select('average_rating, total_count')
    .eq('id', id)
    .single();

  const initialPost = {
    ...postData,
    average_rating: analyticsData?.average_rating || 0,
    total_count: analyticsData?.total_count || 0,
  };

  return <PostClient initialPost={initialPost} />;
}
