// src/utils/date.ts
export function formatDate(dateString: string, formatType: 'short' | 'long' = 'long') {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    if (formatType === 'long') {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.second = "2-digit";
      options.hour12 = false;
    }

    return date.toLocaleString("ko-KR", options);
  }