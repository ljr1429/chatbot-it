# 🚀 새 회사 챗봇 설정 가이드

이 폴더는 새로운 회사를 위한 챗봇을 설정할 때 필요한 모든 파일과 단계별 가이드를 포함합니다.

## 📁 폴더 구조

```
setup-template/
├── README.md                    # 이 파일 (전체 가이드)
├── STEP_BY_STEP.md             # 상세 단계별 가이드
├── config/
│   ├── company.template.json    # 회사 정보 템플릿
│   └── external-links.template.json  # 외부 링크 템플릿
├── supabase/
│   └── schema.sql              # Supabase 테이블 생성 SQL
└── env.example                  # 환경변수 템플릿
```

## ⚡ 빠른 시작 (5단계)

### 1단계: 환경변수 설정
```bash
# 프로젝트 루트에 .env 파일 생성
cp setup-template/env.example .env
# .env 파일을 열어 실제 값 입력
```

### 2단계: Supabase 테이블 생성
```bash
# Supabase SQL Editor에서 실행
# setup-template/supabase/schema.sql 내용 복사 후 실행
```

### 3단계: 회사 정보 설정
```bash
# config/company.json 수정
cp setup-template/config/company.template.json config/company.json
# 회사 정보 입력
```

### 4단계: 외부 링크 설정
```bash
# config/external-links.json 수정
cp setup-template/config/external-links.template.json config/external-links.json
# 링크 정보 입력
```

### 5단계: PDF 인덱싱
```bash
# data/ 폴더에 PDF 파일 복사 후
cd scripts
pip install -r requirements.txt
python index_all_pdfs.py
```

## 📋 체크리스트

- [ ] `.env` 파일 생성 및 API 키 입력
- [ ] Supabase 테이블 생성 (schema.sql 실행)
- [ ] `config/company.json` 회사 정보 수정
- [ ] `config/external-links.json` 외부 링크 수정
- [ ] `data/` 폴더에 PDF 파일 추가
- [ ] PDF 인덱싱 실행
- [ ] 로컬 테스트 (`npm run dev`)
- [ ] Vercel 배포

---

자세한 내용은 `STEP_BY_STEP.md` 파일을 참조하세요.

