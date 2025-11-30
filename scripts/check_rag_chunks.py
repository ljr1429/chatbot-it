# scripts/check_rag_chunks.py
# Supabase rag_chunks 테이블 확인 스크립트

from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv('../.env')

url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE')

if not url or not key:
    print('Error: Environment variables not set')
    print('Please check .env file')
    exit()

supabase = create_client(url, key)

# rag_chunks 테이블 조회
result = supabase.table('rag_chunks').select('id, doc_name, page').execute()

if result.data:
    print(f'Total chunks: {len(result.data)}')
    print()
    
    # 문서별 통계
    docs = {}
    for chunk in result.data:
        doc = chunk.get('doc_name', 'Unknown')
        if doc not in docs:
            docs[doc] = 0
        docs[doc] += 1
    
    print('Chunks per document:')
    for doc, count in docs.items():
        print(f'  - {doc}: {count} chunks')
else:
    print('NO DATA in rag_chunks table!')
    print('PDF indexing is required.')
    print()
    print('Run: npm run index-pdfs')

