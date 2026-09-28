// vite.config.ts 의 noticeImages 플러그인이 만드는 가상 모듈 — public/NoticeImg 의 이미지 URL 목록(파일명 순).
declare module "virtual:notice-images" {
  const noticeImages: string[];
  export default noticeImages;
}
