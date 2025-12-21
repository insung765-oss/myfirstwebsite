// src/app/api/search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q"); // 검색어 가져오기

  if (!query) {
    return NextResponse.json({ error: "검색어가 없습니다." }, { status: 400 });
  }

  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  // 1. 스포티파이 '허가증(Access Token)' 발급받기
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // 2. 발급받은 허가증으로 '노래 검색' 하기
  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const searchData = await searchResponse.json();

  // 3. 필요한 정보만 추려서 프론트엔드로 보내기
  const tracks = searchData.tracks.items.map((track: any) => ({
    id: track.id,
    title: track.name,
    artist: track.artists[0].name,
    coverUrl: track.album.images[0]?.url, // 가장 큰 이미지
  }));

  return NextResponse.json(tracks);
}