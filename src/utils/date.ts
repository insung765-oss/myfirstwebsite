// src/utils/date.ts
export function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24시간제 (오전/오후 원하면 true)
    });
  }