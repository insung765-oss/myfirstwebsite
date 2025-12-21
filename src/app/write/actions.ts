'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addTrackToPlaylist } from '@/lib/spotify';
import { createClient } from '@/lib/supabase/server'; // Use the new helper to create the client

export async function addPost(formData: FormData) {
  const supabase = createClient(); // This now creates a configured Supabase client

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
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
    return {
      error: '게시글을 저장하는 데 실패했습니다.',
    };
  }

  try {
    await addTrackToPlaylist(track_uri);
  } catch (spotifyError) {
    console.error('Spotify add-to-playlist action failed, but post was created.');
  }

  revalidatePath('/');
  redirect('/?post_success=true');
}
