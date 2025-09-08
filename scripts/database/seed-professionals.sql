-- Insertion de professionnels de santé exemple
-- Paris (75000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties, 
  hospital_clinic, address, city_id, postal_code, phone, email, website,
  accepts_glp1, accepts_new_patients, consultation_fee, languages,
  certifications, education, experience_years, bio, verified, featured
) VALUES 
(
  'Pierre', 'Martin', 'Dr.', 'Endocrinologue-Diabétologue', 
  ARRAY['Diabète de type 2', 'Obésité', 'Traitements GLP-1', 'Syndrome métabolique'],
  'Hôpital Pitié-Salpêtrière', '47-83 Boulevard de l''Hôpital, 75013 Paris',
  (SELECT id FROM french_cities WHERE slug = 'paris'), '75013',
  '01 42 16 00 00', 'dr.martin@psl.aphp.fr', 'https://www.aphp.fr',
  true, true, 65.00, ARRAY['Français', 'Anglais'],
  ARRAY['Diplôme d''Endocrinologie', 'Certification GLP-1 Novo Nordisk', 'Formation Obésité'],
  ARRAY['Université Pierre et Marie Curie', 'Internat des Hôpitaux de Paris'],
  18, 'Spécialiste reconnu en diabétologie avec expertise particulière dans les nouveaux traitements GLP-1.',
  true, true
),
(
  'Sophie', 'Dubois', 'Dr.', 'Nutritionniste-Endocrinologue',
  ARRAY['Perte de poids médicalisée', 'Nutrition clinique', 'GLP-1'],
  'Hôpital Saint-Antoine', '184 Rue du Faubourg Saint-Antoine, 75012 Paris',
  (SELECT id FROM french_cities WHERE slug = 'paris'), '75012',
  '01 49 28 20 00', 'dr.dubois@sat.aphp.fr', NULL,
  true, true, 70.00, ARRAY['Français'],
  ARRAY['DES Endocrinologie', 'Certificat Nutrition Clinique'],
  ARRAY['Faculté de Médecine Sorbonne Université'],
  15, 'Experte en prise en charge de l''obésité et prescription de traitements GLP-1.',
  true, true
);

-- Lyon (69000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Jean', 'Durand', 'Pr.', 'Endocrinologue',
  ARRAY['Diabète', 'Obésité', 'Thyroïde'],
  'CHU de Lyon - Hôpital Louis Pradel', '28 Avenue du Doyen Lépine, 69500 Bron',
  (SELECT id FROM french_cities WHERE slug = 'lyon'), '69500',
  '04 72 68 49 49',
  true, true, 60.00, 22, 'Professeur d''endocrinologie, chef de service au CHU de Lyon.',
  true
),
(
  'Marie', 'Lefevre', 'Dr.', 'Diabétologue-Nutritionniste',
  ARRAY['Diabète gestationnel', 'Perte de poids', 'GLP-1'],
  'Clinique du Tonkin', '16 Rue Jean Elié Gautier, 69100 Villeurbanne',
  (SELECT id FROM french_cities WHERE slug = 'villeurbanne'), '69100',
  '04 78 89 20 30',
  true, true, 55.00, 12, 'Spécialiste en diabétologie avec consultation dédiée GLP-1.',
  true
);

-- Marseille (13000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Antoine', 'Rossi', 'Dr.', 'Endocrinologue',
  ARRAY['Obésité morbide', 'Chirurgie bariatrique', 'GLP-1'],
  'Hôpital de la Timone', '264 Rue Saint-Pierre, 13385 Marseille',
  (SELECT id FROM french_cities WHERE slug = 'marseille'), '13005',
  '04 91 38 60 00',
  true, true, 65.00, 16, 'Expert en obésité, coordination pré et post chirurgie bariatrique.',
  true
);

-- Toulouse (31000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Catherine', 'Garcia', 'Dr.', 'Endocrinologue-Diabétologue',
  ARRAY['Diabète de type 1 et 2', 'Pompe à insuline', 'GLP-1'],
  'CHU Toulouse - Hôpital Rangueil', '1 Avenue Jean Poulhès, 31059 Toulouse',
  (SELECT id FROM french_cities WHERE slug = 'toulouse'), '31400',
  '05 61 32 30 50',
  true, true, 62.00, 14, 'Spécialiste en technologies diabétiques et nouveaux traitements.',
  true
);

-- Bordeaux (33000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Philippe', 'Moreau', 'Dr.', 'Nutritionniste',
  ARRAY['Obésité', 'Troubles alimentaires', 'Perte de poids médicalisée'],
  'CHU de Bordeaux - Hôpital Haut-Lévêque', 'Avenue de Magellan, 33604 Pessac',
  (SELECT id FROM french_cities WHERE slug = 'bordeaux'), '33600',
  '05 57 65 65 65',
  true, true, 58.00, 20, 'Nutritionniste spécialisé en obésité avec consultation GLP-1.',
  true
);

-- Lille (59000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Isabelle', 'Bernard', 'Dr.', 'Endocrinologue',
  ARRAY['Diabète', 'Obésité', 'Endocrinologie de la reproduction'],
  'CHRU de Lille - Hôpital Claude Huriez', 'Rue Michel Polonovski, 59037 Lille',
  (SELECT id FROM french_cities WHERE slug = 'lille'), '59000',
  '03 20 44 59 62',
  true, true, 60.00, 17, 'Endocrinologue avec expertise en obésité et prescription GLP-1.',
  true
);

-- Strasbourg (67000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Thomas', 'Schneider', 'Dr.', 'Diabétologue',
  ARRAY['Diabète de type 2', 'Complications diabétiques', 'GLP-1'],
  'Hôpitaux Universitaires de Strasbourg', '1 Place de l''Hôpital, 67091 Strasbourg',
  (SELECT id FROM french_cities WHERE slug = 'strasbourg'), '67000',
  '03 69 55 05 55',
  true, true, 63.00, 13, 'Diabétologue expert en gestion du diabète de type 2 et traitements innovants.',
  true
);

-- Nantes (44000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Sylvie', 'Roux', 'Dr.', 'Nutritionniste-Endocrinologue',
  ARRAY['Obésité infantile', 'Obésité adulte', 'Nutrition thérapeutique'],
  'CHU de Nantes - Hôtel-Dieu', '1 Place Alexis-Ricordeau, 44093 Nantes',
  (SELECT id FROM french_cities WHERE slug = 'nantes'), '44000',
  '02 40 08 33 33',
  true, true, 57.00, 16, 'Spécialiste en nutrition et obésité, pionnier dans l''utilisation des GLP-1.',
  true
);

-- Montpellier (34000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Laurent', 'Blanc', 'Pr.', 'Endocrinologue',
  ARRAY['Recherche clinique', 'Diabète', 'Obésité', 'GLP-1'],
  'CHU de Montpellier - Hôpital Lapeyronie', '371 Avenue du Doyen Gaston Giraud, 34295 Montpellier',
  (SELECT id FROM french_cities WHERE slug = 'montpellier'), '34000',
  '04 67 33 67 33',
  true, true, 68.00, 19, 'Professeur d''endocrinologie, expert en recherche sur les GLP-1.',
  true
);

-- Rennes (35000)
INSERT INTO health_professionals (
  first_name, last_name, title, specialty, sub_specialties,
  hospital_clinic, address, city_id, postal_code, phone,
  accepts_glp1, accepts_new_patients, consultation_fee, experience_years, bio, verified
) VALUES
(
  'Françoise', 'Le Gall', 'Dr.', 'Diabétologue',
  ARRAY['Diabète gestationnel', 'Diabète de type 2', 'Education thérapeutique'],
  'CHU de Rennes - Hôpital Sud', '16 Boulevard de Bulgarie, 35203 Rennes',
  (SELECT id FROM french_cities WHERE slug = 'rennes'), '35000',
  '02 99 26 71 11',
  true, true, 59.00, 15, 'Diabétologue spécialisée en éducation thérapeutique et nouveaux traitements.',
  true
);
