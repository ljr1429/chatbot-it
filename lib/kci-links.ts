// lib/kci-links.ts
// KCI 메뉴 딥링크 사전 (경로 → URL 매핑)

export const KCI_LINKS: Record<string, string> = {
  // 메인/사이트맵
  "KCI 메인": "https://www.kci.go.kr/kciportal/main.kci",
  "사이트맵": "https://www.kci.go.kr/kciportal/siteMap.kci",

  // 논문 검색
  "논문 검색": "https://www.kci.go.kr/kciportal/po/search/poArtiSear.kci",
  "원문 공개 논문 검색": "https://www.kci.go.kr/kciportal/po/search/poArtiTextSear.kci",
  "학술지 권호별 검색": "https://www.kci.go.kr/kciportal/po/search/poArtiSear.kci",
  "참고문헌 검색": "https://www.kci.go.kr/kciportal/po/search/poArtiSear.kci",

  // 학술지 검색
  "학술지 검색": "https://www.kci.go.kr/kciportal/po/search/poSereSear.kci",
  "학술지분류 검색": "https://www.kci.go.kr/kciportal/po/search/poSereSear.kci",

  // 기관/학술대회
  "기관 정보 검색": "https://www.kci.go.kr/kciportal/po/org/poOrgSear.kci",
  "학술대회 검색": "https://www.kci.go.kr/kciportal/po/conf/poConfSear.kci",

  // 인용 정보
  "학술지 인용 정보": "https://www.kci.go.kr/kciportal/po/search/poCitaSear.kci",
  "논문 인용 정보": "https://www.kci.go.kr/kciportal/po/search/poCitaSearList.kci",
  "연구자 인용 정보": "https://www.kci.go.kr/kciportal/po/search/poReseCitaSear.kci",

  // 통계 정보
  "학술지 인용 통계": "https://www.kci.go.kr/kciportal/po/statistics/poStatisticsMain.kci?tab_code=Tab2",
  "소속기관별 인용 통계": "https://www.kci.go.kr/kciportal/po/statistics/poStatisticsMain.kci?tab_code=Tab6",
  "피인용 상위논문": "https://www.kci.go.kr/kciportal/po/statistics/poStatisticsMain.kci?tab_code=Tab5",
  "기관·학술지 통계": "https://www.kci.go.kr/kciportal/po/statistics/poStatisticsMain.kci",
  "Data 구축 통계": "https://www.kci.go.kr/kciportal/po/statistics/poStatisticsMain.kci?tab_code=Tab7",

  // 논문유사도검사
  "논문유사도검사": "https://check.kci.go.kr/",
  "유사도 검사 방법 안내": "https://check.kci.go.kr/guide",

  // 분석정보서비스(연구 동향)
  "연구분야별 연구 동향": "https://www.kci.go.kr/kciportal/po/search/poFielResearchTrendList.kci",
  "학술지별 연구 동향": "https://www.kci.go.kr/kciportal/po/search/poSereResearchTrendList.kci",
};

// KCI 관련 키워드에 해당하는 추천 링크 반환
export function getRecommendedKCILinks(query: string): Array<{ label: string; href: string }> {
  const links: Array<{ label: string; href: string }> = [];

  if (/원문|논문 검색/.test(query)) {
    links.push({ label: "원문 공개 논문 검색", href: KCI_LINKS["원문 공개 논문 검색"] });
  }
  if (/학술지/.test(query)) {
    links.push({ label: "학술지 검색", href: KCI_LINKS["학술지 검색"] });
  }
  if (/인용/.test(query)) {
    links.push({ label: "학술지 인용 정보", href: KCI_LINKS["학술지 인용 정보"] });
    links.push({ label: "소속기관별 인용 통계", href: KCI_LINKS["소속기관별 인용 통계"] });
  }
  if (/통계/.test(query)) {
    links.push({ label: "기관·학술지 통계", href: KCI_LINKS["기관·학술지 통계"] });
  }
  if (/유사도/.test(query)) {
    links.push({ label: "논문유사도검사", href: KCI_LINKS["논문유사도검사"] });
  }
  if (/동향|연구/.test(query)) {
    links.push({ label: "연구분야별 연구 동향", href: KCI_LINKS["연구분야별 연구 동향"] });
  }

  // 기본 링크 (아무것도 매칭 안 되면)
  if (links.length === 0) {
    links.push({ label: "KCI 메인", href: KCI_LINKS["KCI 메인"] });
    links.push({ label: "사이트맵", href: KCI_LINKS["사이트맵"] });
  }

  return links;
}

