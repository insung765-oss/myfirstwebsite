import localFont from 'next/font/local';

export const paperlogy = localFont({
  src: [
    { path: './fonts/Paperlogy-1Thin.ttf', weight: '100' },
    { path: './fonts/Paperlogy-2ExtraLight.ttf', weight: '200' },
    { path: './fonts/Paperlogy-3Light.ttf', weight: '300' },
    { path: './fonts/Paperlogy-4Regular.ttf', weight: '400' },
    { path: './fonts/Paperlogy-5Medium.ttf', weight: '500' },
    { path: './fonts/Paperlogy-6SemiBold.ttf', weight: '600' },
    { path: './fonts/Paperlogy-7Bold.ttf', weight: '700' },
    { path: './fonts/Paperlogy-8ExtraBold.ttf', weight: '800' },
    { path: './fonts/Paperlogy-9Black.ttf', weight: '900' },
  ],
  display: 'swap',
  variable: '--font-paperlogy', // CSS 변수 추가
});
