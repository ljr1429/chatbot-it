// lib/config.ts
// 회사별 설정을 config/ 폴더에서 동적으로 로드

import fs from 'fs'
import path from 'path'

export interface CompanyConfig {
  name: string
  shortName?: string
  description?: string
  contact: {
    email: string
    phone?: string
    website?: string
  }
  branding?: {
    primaryColor?: string
    logoUrl?: string
    faviconUrl?: string
  }
  chatbot: {
    title: string
    welcomeMessage: string
    placeholderText?: string
    sampleQuestions: string[]
  }
  features?: {
    enableExternalLinks?: boolean
    enableQueryLogs?: boolean
    enableFAQ?: boolean
    enableRAG?: boolean
  }
  faqKeywords?: {
    fees?: string[]
    schedule?: string[]
    membership?: string[]
    submission?: string[]
  }
}

export interface ExternalLinksConfig {
  enabled: boolean
  keywords: string[]
  links: Record<string, string>
  autoMatch?: Array<{
    keywords: string[]
    links: string[]
  }>
}

let companyConfig: CompanyConfig | null = null
let linksConfig: ExternalLinksConfig | null = null

/**
 * 회사 설정 로드
 */
export function getCompanyConfig(): CompanyConfig {
  if (companyConfig) return companyConfig
  
  const configPath = path.join(process.cwd(), 'config/company.json')
  
  if (!fs.existsSync(configPath)) {
    throw new Error('config/company.json 파일이 없습니다. 먼저 설정 파일을 생성해주세요.')
  }
  
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8')
    companyConfig = JSON.parse(fileContent)
    return companyConfig!
  } catch (error) {
    throw new Error(`company.json 파싱 오류: ${error}`)
  }
}

/**
 * 외부 링크 설정 로드 (선택사항)
 */
export function getExternalLinksConfig(): ExternalLinksConfig | null {
  if (linksConfig !== null) return linksConfig
  
  const configPath = path.join(process.cwd(), 'config/external-links.json')
  
  if (!fs.existsSync(configPath)) {
    linksConfig = null
    return null
  }
  
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8')
    linksConfig = JSON.parse(fileContent)
    return linksConfig
  } catch (error) {
    console.error('external-links.json 파싱 오류:', error)
    linksConfig = null
    return null
  }
}

/**
 * 질문과 매칭되는 외부 링크 반환
 */
export function getRecommendedLinks(query: string): Array<{ label: string; href: string }> {
  const linksConfig = getExternalLinksConfig()
  
  if (!linksConfig || !linksConfig.enabled) {
    return []
  }
  
  const results: Array<{ label: string; href: string }> = []
  const addedLinks = new Set<string>()
  
  // autoMatch 규칙 적용
  if (linksConfig.autoMatch) {
    for (const rule of linksConfig.autoMatch) {
      const keywordRegex = new RegExp(rule.keywords.join('|'), 'i')
      
      if (keywordRegex.test(query)) {
        for (const linkLabel of rule.links) {
          const href = linksConfig.links[linkLabel]
          if (href && !addedLinks.has(linkLabel)) {
            results.push({ label: linkLabel, href })
            addedLinks.add(linkLabel)
          }
        }
      }
    }
  }
  
  // 매칭된 링크가 없으면 기본 링크 제공
  if (results.length === 0) {
    const defaultLinks = ['KCI 메인', '사이트맵']
    for (const label of defaultLinks) {
      const href = linksConfig.links[label]
      if (href) {
        results.push({ label, href })
      }
    }
  }
  
  return results
}

/**
 * KCI 관련 키워드 체크 (외부 링크 기능 활성화 시)
 */
export function shouldUseExternalLinks(query: string): boolean {
  const linksConfig = getExternalLinksConfig()
  
  if (!linksConfig || !linksConfig.enabled || !linksConfig.keywords.length) {
    return false
  }
  
  const keywordRegex = new RegExp(linksConfig.keywords.join('|'), 'i')
  return keywordRegex.test(query)
}

/**
 * FAQ 키워드 정규식 (회사 설정에서 활성화 시)
 */
export function getFAQKeywords(): RegExp | null {
  const config = getCompanyConfig()
  
  if (!config.features?.enableFAQ) {
    return null
  }
  
  // config에 faqKeywords가 있으면 사용
  if (config.faqKeywords) {
    const allKeywords = [
      ...(config.faqKeywords.fees || []),
      ...(config.faqKeywords.schedule || []),
      ...(config.faqKeywords.membership || []),
      ...(config.faqKeywords.submission || [])
    ]
    
    if (allKeywords.length > 0) {
      return new RegExp(allKeywords.join('|'), 'i')
    }
  }
  
  // 기본 FAQ 키워드 (폴백)
  return /(발간|일정|비용|심사비|게재료|초과페이지|회원|정회원|가입|회비|제출|양식|메일|제목|계좌|연락)/
}

/**
 * 특정 카테고리의 FAQ 키워드 매칭 여부 확인
 */
export function matchesFAQCategory(query: string, category: 'fees' | 'schedule' | 'membership' | 'submission'): boolean {
  const config = getCompanyConfig()
  
  if (!config.faqKeywords || !config.faqKeywords[category]) {
    // 기본 키워드로 폴백
    const defaultKeywords: Record<string, string[]> = {
      fees: ['비용', '심사비', '게재료', '초과페이지'],
      schedule: ['발간', '일정'],
      membership: ['회원', '정회원', '가입', '회비'],
      submission: ['제출', '양식', '메일', '제목']
    }
    
    const keywords = defaultKeywords[category] || []
    const regex = new RegExp(keywords.join('|'), 'i')
    return regex.test(query)
  }
  
  const keywords = config.faqKeywords[category]
  if (!keywords || keywords.length === 0) {
    return false
  }
  
  const regex = new RegExp(keywords.join('|'), 'i')
  return regex.test(query)
}

