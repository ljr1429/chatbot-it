#!/usr/bin/env node
/**
 * 설정 파일 검증 스크립트
 * 
 * 실행: npm run validate-config
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 설정 파일 검증 시작...\n')

let errors = []
let warnings = []

// company.json 검증
console.log('📋 company.json 검증')
const companyPath = path.join(__dirname, '../config/company.json')

if (!fs.existsSync(companyPath)) {
  errors.push('config/company.json 파일이 없습니다.')
} else {
  try {
    const company = JSON.parse(fs.readFileSync(companyPath, 'utf-8'))
    
    // 필수 필드
    if (!company.name) errors.push('company.name 필드가 필요합니다.')
    if (!company.contact?.email) errors.push('company.contact.email 필드가 필요합니다.')
    if (!company.chatbot?.title) errors.push('company.chatbot.title 필드가 필요합니다.')
    if (!company.chatbot?.welcomeMessage) errors.push('company.chatbot.welcomeMessage 필드가 필요합니다.')
    if (!company.chatbot?.sampleQuestions || company.chatbot.sampleQuestions.length === 0) {
      warnings.push('company.chatbot.sampleQuestions가 비어있습니다.')
    }
    
    console.log('✅ company.json 유효함')
  } catch (error) {
    errors.push(`company.json 파싱 오류: ${error.message}`)
  }
}

// external-links.json 검증 (선택)
console.log('\n📋 external-links.json 검증 (선택사항)')
const linksPath = path.join(__dirname, '../config/external-links.json')

if (fs.existsSync(linksPath)) {
  try {
    const links = JSON.parse(fs.readFileSync(linksPath, 'utf-8'))
    
    if (links.enabled && Object.keys(links.links).length === 0) {
      warnings.push('external-links.enabled=true인데 links가 비어있습니다.')
    }
    
    console.log('✅ external-links.json 유효함')
  } catch (error) {
    errors.push(`external-links.json 파싱 오류: ${error.message}`)
  }
} else {
  console.log('⚪ external-links.json 없음')
}

// 결과 출력
console.log('\n' + '='.repeat(60))

if (errors.length > 0) {
  console.log('❌ 오류:')
  errors.forEach(err => console.log(`   - ${err}`))
}

if (warnings.length > 0) {
  console.log('\n⚠️  경고:')
  warnings.forEach(warn => console.log(`   - ${warn}`))
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ 모든 설정이 유효합니다!')
}

console.log('='.repeat(60) + '\n')

process.exit(errors.length > 0 ? 1 : 0)

