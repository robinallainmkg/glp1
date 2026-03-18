-- Migration 021: Annuaire médecins GLP-1 par département
-- Permet au Coach IA de recommander des médecins concrets

CREATE TABLE IF NOT EXISTS doctor_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_code VARCHAR(3) NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  doctor_name VARCHAR(200) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  facility_name VARCHAR(300),
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(500),
  website VARCHAR(500),
  accepts_new_patients BOOLEAN DEFAULT true,
  notes TEXT,
  source VARCHAR(100) DEFAULT 'manual',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_doctor_directory_dept ON doctor_directory(department_code) WHERE is_active = true;
CREATE INDEX idx_doctor_directory_specialty ON doctor_directory(specialty) WHERE is_active = true;

ALTER TABLE doctor_directory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_doctors" ON doctor_directory FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "service_role_all_doctors" ON doctor_directory FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION search_doctors(dept_code VARCHAR, max_results INT DEFAULT 10)
RETURNS SETOF doctor_directory
LANGUAGE sql STABLE
AS $$
  SELECT * FROM doctor_directory
  WHERE department_code = dept_code AND is_active = true
  ORDER BY doctor_name ASC
  LIMIT max_results;
$$;
