import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN; // 3단계에서 설명
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID; // 3단계에서 설명

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// 1. 만료된 토큰을 갱신해서 새 액세스 토큰을 받아오는 함수
const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN!,
    }),
  });

  return response.json();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trackId } = body; // 프론트에서 보낸 노래 ID

    if (!trackId) {
      return NextResponse.json({ error: "Track ID is required" }, { status: 400 });
    }

    // 2. 액세스 토큰 발급
    const { access_token } = await getAccessToken();

    // 3. 플레이리스트에 곡 추가 요청
    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`], // ID를 URI 형태로 변환
        }),
      }
    );

    if (!spotifyRes.ok) {
      const errorData = await spotifyRes.json();
      throw new Error(errorData.error?.message || "Failed to add track");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Spotify API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}