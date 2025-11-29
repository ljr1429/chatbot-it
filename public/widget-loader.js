/**
 * AI 챗봇 위젯 로더
 * 
 * 사용법: 외부 HTML에 아래 코드 삽입
 * <script src="https://your-chatbot-domain.com/widget-loader.js" data-chatbot-url="https://your-chatbot-domain.com"></script>
 */

(function() {
  // 설정
  const scriptTag = document.currentScript;
  const chatbotUrl = scriptTag?.getAttribute('data-chatbot-url') || window.location.origin;
  const position = scriptTag?.getAttribute('data-position') || 'right'; // 'left' or 'right'
  const primaryColor = scriptTag?.getAttribute('data-color') || '#2563eb';
  
  // 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    #chatbot-widget-container {
      position: fixed;
      bottom: 20px;
      ${position === 'left' ? 'left: 20px;' : 'right: 20px;'}
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #chatbot-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    #chatbot-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    
    #chatbot-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    
    #chatbot-widget-button.open svg.chat-icon {
      display: none;
    }
    
    #chatbot-widget-button.open svg.close-icon {
      display: block;
    }
    
    #chatbot-widget-button svg.close-icon {
      display: none;
    }
    
    #chatbot-widget-iframe {
      position: absolute;
      bottom: 70px;
      ${position === 'left' ? 'left: 0;' : 'right: 0;'}
      width: 380px;
      height: 550px;
      border: none;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
      background: white;
    }
    
    #chatbot-widget-iframe.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    
    @media (max-width: 480px) {
      #chatbot-widget-iframe {
        width: calc(100vw - 40px);
        height: calc(100vh - 140px);
        bottom: 80px;
        ${position === 'left' ? 'left: -10px;' : 'right: -10px;'}
      }
    }
  `;
  document.head.appendChild(style);
  
  // 컨테이너 생성
  const container = document.createElement('div');
  container.id = 'chatbot-widget-container';
  
  // iframe 생성
  const iframe = document.createElement('iframe');
  iframe.id = 'chatbot-widget-iframe';
  iframe.src = chatbotUrl + '/widget';
  iframe.title = 'AI 챗봇';
  
  // 버튼 생성
  const button = document.createElement('button');
  button.id = 'chatbot-widget-button';
  button.innerHTML = `
    <svg class="chat-icon" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    </svg>
    <svg class="close-icon" viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `;
  button.setAttribute('aria-label', '챗봇 열기');
  
  // 토글 기능
  let isOpen = false;
  button.addEventListener('click', function() {
    isOpen = !isOpen;
    iframe.classList.toggle('open', isOpen);
    button.classList.toggle('open', isOpen);
    button.setAttribute('aria-label', isOpen ? '챗봇 닫기' : '챗봇 열기');
  });
  
  // DOM에 추가
  container.appendChild(iframe);
  container.appendChild(button);
  document.body.appendChild(container);
})();

