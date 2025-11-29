# 🔌 챗봇 위젯 삽입 가이드

다른 웹사이트에 챗봇을 플로팅 위젯으로 삽입하는 방법입니다.

---

## 빠른 시작

### 방법 1: 스크립트 삽입 (권장)

외부 HTML 파일의 `</body>` 태그 바로 앞에 추가:

```html
<script 
  src="https://your-chatbot-domain.com/widget-loader.js" 
  data-chatbot-url="https://your-chatbot-domain.com"
></script>
```

### 방법 2: iframe 직접 삽입

```html
<iframe 
  src="https://your-chatbot-domain.com/widget" 
  style="position: fixed; bottom: 20px; right: 20px; width: 380px; height: 550px; border: none; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 99999;"
  title="AI 챗봇"
></iframe>
```

---

## 옵션 설정

### 스크립트 속성

| 속성 | 설명 | 기본값 |
|------|------|--------|
| `data-chatbot-url` | 챗봇 서버 URL | 현재 도메인 |
| `data-position` | 버튼 위치 (`left` / `right`) | `right` |
| `data-color` | 버튼 색상 (HEX) | `#2563eb` |

### 예시: 왼쪽에 녹색 버튼

```html
<script 
  src="https://your-chatbot-domain.com/widget-loader.js" 
  data-chatbot-url="https://your-chatbot-domain.com"
  data-position="left"
  data-color="#10b981"
></script>
```

---

## 워드프레스 삽입

### 방법 1: 테마 편집

1. 외모 → 테마 편집기 → `footer.php`
2. `</body>` 앞에 스크립트 추가

### 방법 2: 플러그인 사용

"Insert Headers and Footers" 플러그인 설치 후 Footer Scripts에 추가

---

## 카페24/고도몰 삽입

1. 관리자 → 디자인 → 레이아웃 설정
2. 푸터(Footer) 영역 편집
3. 스크립트 코드 추가

---

## Wix 삽입

1. 사이트 편집기 열기
2. "+" → "Embed" → "Custom Element"
3. "코드 추가" 선택
4. iframe 코드 붙여넣기

---

## CORS 설정

다른 도메인에서 위젯을 사용하려면 CORS 설정이 필요할 수 있습니다.

### Next.js 설정 (`next.config.js`)

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/widget',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
        ],
      },
    ];
  },
};
```

---

## 테스트 방법

### 로컬 테스트

1. 챗봇 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000/widget` 접속
3. 위젯 UI 확인

### 외부 삽입 테스트

```html
<!DOCTYPE html>
<html>
<head>
  <title>테스트 페이지</title>
</head>
<body>
  <h1>우리 회사 홈페이지</h1>
  <p>챗봇 위젯이 오른쪽 하단에 표시됩니다.</p>
  
  <!-- 챗봇 위젯 -->
  <script 
    src="http://localhost:3000/widget-loader.js" 
    data-chatbot-url="http://localhost:3000"
  ></script>
</body>
</html>
```

---

## 스타일 커스터마이징

### 버튼 크기 변경

`widget-loader.js`에서 수정:

```css
#chatbot-widget-button {
  width: 70px;  /* 기본 60px */
  height: 70px;
}
```

### 채팅창 크기 변경

```css
#chatbot-widget-iframe {
  width: 420px;   /* 기본 380px */
  height: 600px;  /* 기본 550px */
}
```

---

## 문제 해결

### 위젯이 보이지 않음

1. 콘솔에서 오류 확인 (F12)
2. `data-chatbot-url` 값 확인
3. HTTPS/HTTP 혼합 콘텐츠 문제 확인

### 버튼은 보이지만 채팅창이 안 열림

1. iframe src URL 확인
2. CORS 설정 확인
3. 챗봇 서버 상태 확인

### 모바일에서 레이아웃 깨짐

위젯은 반응형으로 설계되어 있습니다. 문제가 있으면 `widget-loader.js`의 미디어 쿼리 수정.

---

## 보안 고려사항

1. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 사용
2. **도메인 제한**: 특정 도메인에서만 위젯 허용 시 CORS 설정
3. **Rate Limiting**: API에 요청 제한 설정 권장

