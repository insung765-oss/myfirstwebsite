// src/utils/date.ts
export function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul", // 👈 한국 시간대 적용
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit", // 초 단위까지 표시
      hour12: false,
    });
  }