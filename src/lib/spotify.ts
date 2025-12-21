import SpotifyWebApi from 'spotify-web-api-node';

// 서버 측에서만 사용될 스포티파이 API 클라이언트입니다.
// 환경 변수를 사용하여 초기화합니다.
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
});

/**
 * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 가져옵니다.
 * API 호출 전에 항상 이 함수를 호출하여 토큰을 최신 상태로 유지해야 합니다.
 */
async function refreshAccessToken() {
  try {
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('Successfully refreshed Spotify access token.');
  } catch (error) {
    console.error('Could not refresh Spotify access token', error);
    throw new Error('Failed to refresh Spotify access token');
  }
}

/**
 * 지정된 트랙을 환경 변수에 설정된 플레이리스트에 추가합니다.
 * @param trackUri 추가할 노래의 Spotify URI (e.g., "spotify:track:4iV5W9uYEdYUVa79Axb7Rh")
 */
export async function addTrackToPlaylist(trackUri: string) {
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

  // 필수 환경 변수가 설정되었는지 확인합니다.
  if (!playlistId || !process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
    console.warn(
      'Spotify environment variables are not fully configured. Skipping adding track to playlist.'
    );
    // 프로덕션 환경에서는 오류를 발생시키는 대신 경고만 기록하고 넘어갑니다.
    // 글 작성 자체가 실패하는 것을 방지하기 위함입니다.
    return { success: false, error: 'Spotify environment not configured.' };
  }

  try {
    // API 호출 전 항상 토큰을 새로고침합니다.
    await refreshAccessToken();

    // 플레이리스트에 트랙을 추가합니다.
    await spotifyApi.addTracksToPlaylist(playlistId, [trackUri]);

    console.log(`Successfully added track ${trackUri} to playlist ${playlistId}`);
    return { success: true };

  } catch (error: any) {
    console.error('Error adding track to Spotify playlist:', error.body || error.message);
    
    // 이미 플레이리스트에 곡이 있는 경우, 오류로 처리하지 않고 성공으로 간주합니다.
    if (error.body?.error?.message.toLowerCase().includes('duplicate')) {
      console.log('Track is already in the playlist.');
      return { success: true, message: 'Track already in playlist.' };
    }

    return { success: false, error: 'Failed to add track to Spotify.' };
  }
}
