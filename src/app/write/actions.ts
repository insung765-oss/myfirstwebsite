'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addTrackToPlaylist } from '@/lib/spotify'; // 스포티파이 모듈 가져오기

export async function addPost(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    // 로그인 페이지로 리디렉션하거나 오류 메시지를 표시할 수 있습니다.
    return redirect('/login?message=로그인이 필요합니다.');
  }

  const content = formData.get('content') as string;
  const track_id = formData.get('track_id') as string;
  const track_title = formData.get('track_title') as string;
  const track_artist = formData.get('track_artist') as string;
  const track_album_art_url = formData.get('track_album_art_url') as string;

  if (!content || !track_id || !track_title || !track_artist || !track_album_art_url) {
    return {
      error: '모든 필드를 채워주세요.',
    };
  }

  const track_uri = `spotify:track:${track_id}`;

  const { error: postError } = await supabase
    .from('posts')
    .insert([
      {
        user_id: user.id,
        content,
        track_id,
        track_title,
        track_artist,
        track_album_art_url,
        track_uri,
      },
    ]);

  if (postError) {
    console.error('Error inserting post:', postError);
    // UI에 표시할 오류 메시지를 반환할 수 있습니다.
    return {
      error: '게시글을 저장하는 데 실패했습니다.',
    };
  }

  // --- 스포티파이 플레이리스트에 노래 추가 --- //
  // 이 과정이 실패하더라도 글 작성은 이미 완료되었으므로, 사용자 경험을 막지 않습니다.
  try {
    await addTrackToPlaylist(track_uri);
  } catch (spotifyError) {
    // addTrackToPlaylist 함수 내에서 이미 자세한 오류를 콘솔에 기록합니다.
    console.error('Spotify add-to-playlist action failed, but post was created.');
  }
  // ------------------------------------------ //

  // 캐시를 무효화하고 사용자를 메인 페이지로 리디렉션합니다.
  revalidatePath('/');
  redirect('/?post_success=true');
}