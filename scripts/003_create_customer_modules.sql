-- 고객사 테이블 생성
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 모듈 정의 테이블 생성 (CVE, CCE, 메티아이 등)
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 고객사별 모듈 버전 정보 테이블
CREATE TABLE IF NOT EXISTS customer_module_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  version TEXT,
  image_url TEXT,
  notes TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, module_id)
);

-- 기본 모듈 데이터 삽입
INSERT INTO modules (name, description) VALUES
  ('SolidStep CVE', 'CVE 취약점 관리 솔루션'),
  ('SolidStep CCE', 'CCE 보안 설정 관리 솔루션'),
  ('메티아이', '메티아이 솔루션')
ON CONFLICT (name) DO NOTHING;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_customer_modules_customer_id ON customer_module_versions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_modules_module_id ON customer_module_versions(module_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_module_versions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 생성
CREATE POLICY "Allow public read access on customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Allow public read access on customer_module_versions" ON customer_module_versions FOR SELECT USING (true);

-- 모든 사용자가 쓰기 가능하도록 정책 생성 (실제 운영시에는 인증 추가 필요)
CREATE POLICY "Allow public insert on customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on customers" ON customers FOR DELETE USING (true);

CREATE POLICY "Allow public insert on modules" ON modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on modules" ON modules FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on customer_module_versions" ON customer_module_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on customer_module_versions" ON customer_module_versions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on customer_module_versions" ON customer_module_versions FOR DELETE USING (true);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_module_versions_updated_at BEFORE UPDATE ON customer_module_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

