#!/usr/bin/env node
/**
 * 회사 챗봇 자동 설정 스크립트
 * 
 * 실행: npm run setup
 * 
 * 작업 내용:
 * 1. 환경변수 검증
 * 2. config/company.json 검증
 * 3. data/ 폴더의 모든 PDF 확인
 * 4. Supabase 연결 확인
 * 5. PDF 인덱싱 (python scripts/index_pdf.py)
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)

require('dotenv').config()

console.log('🚀 챗봇 설정을 시작합니다...\n')

// 단계별 실행
async function main() {
  try {
    // Step 1: 환경변수 체크
    console.log('📋 Step 1: 환경변수 확인')
    checkEnvVariables()
    console.log('✅ 환경변수 확인 완료\n')

    // Step 2: company.json 검증
    console.log('📋 Step 2: 회사 설정 검증')
    const companyConfig = validateCompanyConfig()
    console.log(`✅ 회사 설정 확인: ${companyConfig.name}\n`)

    // Step 3: PDF 파일 확인
    console.log('📋 Step 3: PDF 파일 확인')
    const pdfFiles = checkPDFFiles()
    console.log(`✅ ${pdfFiles.length}개의 PDF 파일 발견:`)
    pdfFiles.forEach(f => console.log(`   - ${path.basename(f)}`))
    console.log()

    // Step 4: Supabase 스키마 확인
    console.log('📋 Step 4: Supabase 준비 확인')
    console.log('💡 Supabase에서 schema.sql을 실행했는지 확인하세요.')
    console.log('   URL: https://app.supabase.com → SQL Editor → schema.sql 실행\n')
    
    const answer = await askQuestion('✅ Supabase 스키마를 실행했나요? (y/n): ')
    if (answer.toLowerCase() !== 'y') {
      console.log('\n⚠️  먼저 Supabase에서 schema.sql을 실행해주세요.')
      console.log('   파일 위치: supabase/schema.sql')
      process.exit(1)
    }

    // Step 5: PDF 인덱싱
    console.log('\n📋 Step 5: PDF 인덱싱 시작')
    console.log('⏳ 이 작업은 수 분이 걸릴 수 있습니다...\n')
    
    await indexAllPDFs(pdfFiles)
    console.log('\n✅ PDF 인덱싱 완료\n')

    // Step 6: 외부 링크 설정 확인
    console.log('📋 Step 6: 외부 링크 설정 확인')
    checkExternalLinks()

    // 완료
    console.log('\n' + '='.repeat(60))
    console.log('🎉 챗봇 설정이 완료되었습니다!')
    console.log('='.repeat(60))
    console.log('\n다음 명령어로 로컬에서 테스트하세요:')
    console.log('\n  npm run dev')
    console.log('\n테스트 후 배포:')
    console.log('\n  vercel deploy')
    console.log()
    
  } catch (error) {
    console.error('\n❌ 설정 중 오류 발생:', error.message)
    process.exit(1)
  }
}

/**
 * 환경변수 확인
 */
function checkEnvVariables() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE',
    'OPENAI_API_KEY'
  ]

  const missing = requiredEnvVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ 다음 환경변수가 누락되었습니다:', missing.join(', '))
    console.error('💡 .env 파일을 확인해주세요.')
    throw new Error('환경변수 누락')
  }
}

/**
 * company.json 검증
 */
function validateCompanyConfig() {
  const configPath = path.join(__dirname, '../config/company.json')

  if (!fs.existsSync(configPath)) {
    throw new Error('config/company.json 파일이 없습니다.')
  }

  const companyConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

  if (!companyConfig.name || !companyConfig.contact?.email) {
    throw new Error('company.json에 필수 필드가 누락되었습니다. (name, contact.email)')
  }

  return companyConfig
}

/**
 * PDF 파일 확인
 */
function checkPDFFiles() {
  const dataDir = path.join(__dirname, '../data')
  
  if (!fs.existsSync(dataDir)) {
    throw new Error('data/ 폴더가 없습니다.')
  }

  const pdfFiles = fs.readdirSync(dataDir)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(f => path.join(dataDir, f))

  if (pdfFiles.length === 0) {
    throw new Error('data/ 폴더에 PDF 파일이 없습니다. 회사 문서를 추가해주세요.')
  }

  return pdfFiles
}

/**
 * 모든 PDF 인덱싱
 */
async function indexAllPDFs(pdfFiles) {
  let completed = 0
  let failed = 0

  for (const pdfFile of pdfFiles) {
    const fileName = path.basename(pdfFile)
    console.log(`⏳ ${fileName} 처리 중...`)
    
    try {
      await execPromise(`python scripts/index_pdf.py "${pdfFile}"`)
      console.log(`✅ ${fileName} 완료`)
      completed++
    } catch (error) {
      console.error(`❌ ${fileName} 실패:`, error.message)
      failed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`완료: ${completed}개 / 실패: ${failed}개`)
  console.log('='.repeat(50))

  if (failed === pdfFiles.length) {
    throw new Error('모든 PDF 인덱싱 실패')
  }
}

/**
 * 외부 링크 설정 확인
 */
function checkExternalLinks() {
  const linksConfigPath = path.join(__dirname, '../config/external-links.json')

  if (fs.existsSync(linksConfigPath)) {
    const linksConfig = JSON.parse(fs.readFileSync(linksConfigPath, 'utf-8'))
    if (linksConfig.enabled) {
      console.log(`✅ 외부 링크 ${Object.keys(linksConfig.links).length}개 설정됨`)
    } else {
      console.log('⚪ 외부 링크 기능 비활성화됨')
    }
  } else {
    console.log('⚪ external-links.json 없음 (선택사항)')
  }
}

/**
 * 사용자 입력 받기
 */
function askQuestion(query) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    readline.question(query, answer => {
      readline.close()
      resolve(answer)
    })
  })
}

// 실행
main()

