-- Exemple de professionnels de santé spécialisés GLP-1
INSERT INTO healthcare_professionals (
  first_name, last_name, title, specialty, phone, email, website,
  street_address, city, postal_code, department, region,
  latitude, longitude, consultation_types, languages,
  accepts_new_patients, consultation_fee_range, medical_school,
  certifications, years_experience, glp1_specialist,
  practice_type, establishment_name, establishment_type,
  verified, featured, slug, meta_description
) VALUES

-- Paris
('Pierre', 'Martin', 'Dr.', 'Endocrinologue-Diabétologue', '01.42.34.56.78', 'dr.martin@chu-paris.fr', 'https://chu-paris.fr/dr-martin',
 '47 Boulevard de l''Hôpital', 'Paris', '75013', 'Paris', 'Île-de-France',
 48.8370, 2.3646, ARRAY['GLP-1', 'Diabète', 'Obésité'], ARRAY['Français', 'Anglais'],
 true, '80-120€', 'Université Paris Descartes', 
 ARRAY['DES Endocrinologie', 'Certification GLP-1 Novo Nordisk'], 15, true,
 'Hôpital public', 'CHU Pitié-Salpêtrière', 'CHU',
 true, true, 'dr-pierre-martin-endocrinologue-paris', 'Dr Pierre Martin, endocrinologue spécialisé GLP-1 à Paris. Consultation diabète et obésité au CHU Pitié-Salpêtrière.'),

('Sophie', 'Dubois', 'Dr.', 'Endocrinologue', '01.47.23.45.67', 'sophie.dubois@hopital-paris.fr', 'https://hopital-paris.fr/endocrinologie',
 '1 Rue de la Santé', 'Paris', '75014', 'Paris', 'Île-de-France',
 48.8370, 2.3370, ARRAY['GLP-1', 'Diabète', 'Nutrition'], ARRAY['Français'],
 true, '70-100€', 'Université Paris Diderot',
 ARRAY['DES Endocrinologie', 'DIU Nutrition'], 12, true,
 'Hôpital public', 'Hôpital Cochin', 'Hôpital',
 true, false, 'dr-sophie-dubois-endocrinologue-paris', 'Dr Sophie Dubois, endocrinologue Paris 14e. Spécialiste traitements GLP-1 et nutrition thérapeutique.'),

-- Lyon
('Émilie', 'Martin', 'Dr.', 'Diabétologue-Nutritionniste', '04.72.11.22.33', 'emilie.martin@chu-lyon.fr', 'https://chu-lyon.fr/diabetologie',
 '165 Chemin du Grand Revoyet', 'Lyon', '69310', 'Rhône', 'Auvergne-Rhône-Alpes',
 45.7740, 4.8570, ARRAY['GLP-1', 'Diabète', 'Nutrition', 'Obésité'], ARRAY['Français', 'Anglais'],
 true, '75-110€', 'Université Claude Bernard Lyon 1',
 ARRAY['DES Endocrinologie', 'Capacité Diabétologie', 'Formation GLP-1'], 18, true,
 'Hôpital public', 'CHU de Lyon', 'CHU',
 true, true, 'dr-emilie-martin-diabetologue-lyon', 'Dr Émilie Martin, diabétologue nutritionniste Lyon. Experte GLP-1 et prise en charge obésité au CHU Lyon Sud.'),

('Jean', 'Rousseau', 'Dr.', 'Endocrinologue', '04.78.45.67.89', 'j.rousseau@clinique-lyon.fr', 'https://clinique-lyon.fr',
 '25 Boulevard des Belges', 'Lyon', '69006', 'Rhône', 'Auvergne-Rhône-Alpes',
 45.7640, 4.8400, ARRAY['GLP-1', 'Diabète'], ARRAY['Français'],
 true, '90-130€', 'Université Claude Bernard Lyon 1',
 ARRAY['DES Endocrinologie'], 10, true,
 'Clinique privée', 'Clinique du Parc', 'Clinique privée',
 true, false, 'dr-jean-rousseau-endocrinologue-lyon', 'Dr Jean Rousseau, endocrinologue Lyon 6e. Consultations GLP-1 et diabète en clinique privée.'),

-- Marseille
('Marie', 'Dubois', 'Dr.', 'Endocrinologue', '04.91.12.34.56', 'marie.dubois@ap-hm.fr', 'https://ap-hm.fr/endocrinologie',
 '264 Rue Saint-Pierre', 'Marseille', '13005', 'Bouches-du-Rhône', 'Provence-Alpes-Côte d''Azur',
 43.2920, 5.4020, ARRAY['GLP-1', 'Diabète', 'Obésité'], ARRAY['Français', 'Anglais', 'Italien'],
 true, '70-100€', 'Université Aix-Marseille',
 ARRAY['DES Endocrinologie', 'Formation continue GLP-1'], 14, true,
 'Hôpital public', 'Hôpital Nord', 'CHU',
 true, true, 'dr-marie-dubois-endocrinologue-marseille', 'Dr Marie Dubois, endocrinologue Marseille. Spécialiste GLP-1 et obésité à l''AP-HM Hôpital Nord.'),

-- Toulouse
('Antoine', 'Garcia', 'Dr.', 'Diabétologue', '05.61.23.45.67', 'a.garcia@chu-toulouse.fr', 'https://chu-toulouse.fr',
 '1 Avenue Jean Poulhès', 'Toulouse', '31059', 'Haute-Garonne', 'Occitanie',
 43.6147, 1.4442, ARRAY['GLP-1', 'Diabète'], ARRAY['Français', 'Espagnol'],
 true, '75-105€', 'Université Toulouse III',
 ARRAY['DES Endocrinologie', 'Capacité Diabétologie'], 16, true,
 'Hôpital public', 'CHU Rangueil', 'CHU',
 true, false, 'dr-antoine-garcia-diabetologue-toulouse', 'Dr Antoine Garcia, diabétologue Toulouse. Consultations GLP-1 et diabète au CHU Rangueil.'),

-- Nice
('Catherine', 'Lemoine', 'Dr.', 'Endocrinologue', '04.93.12.34.56', 'catherine.lemoine@chu-nice.fr', 'https://chu-nice.fr',
 '30 Voie Romaine', 'Nice', '06001', 'Alpes-Maritimes', 'Provence-Alpes-Côte d''Azur',
 43.7102, 7.2620, ARRAY['GLP-1', 'Diabète', 'Nutrition'], ARRAY['Français', 'Anglais'],
 true, '80-120€', 'Université Nice Sophia Antipolis',
 ARRAY['DES Endocrinologie', 'DIU Obésité'], 13, true,
 'Hôpital public', 'CHU de Nice', 'CHU',
 true, true, 'dr-catherine-lemoine-endocrinologue-nice', 'Dr Catherine Lemoine, endocrinologue Nice. Experte GLP-1 et nutrition au CHU de Nice.'),

-- Nantes
('François', 'Moreau', 'Dr.', 'Endocrinologue', '02.40.12.34.56', 'f.moreau@chu-nantes.fr', 'https://chu-nantes.fr',
 '1 Place Alexis Ricordeau', 'Nantes', '44093', 'Loire-Atlantique', 'Pays de la Loire',
 47.2184, -1.5536, ARRAY['GLP-1', 'Diabète'], ARRAY['Français'],
 true, '70-100€', 'Université de Nantes',
 ARRAY['DES Endocrinologie'], 11, true,
 'Hôpital public', 'CHU de Nantes', 'CHU',
 true, false, 'dr-francois-moreau-endocrinologue-nantes', 'Dr François Moreau, endocrinologue Nantes. Spécialiste GLP-1 au CHU de Nantes.'),

-- Montpellier
('Isabelle', 'Fabre', 'Dr.', 'Diabétologue-Nutritionniste', '04.67.33.22.11', 'i.fabre@chu-montpellier.fr', 'https://chu-montpellier.fr',
 '191 Avenue du Doyen Gaston Giraud', 'Montpellier', '34295', 'Hérault', 'Occitanie',
 43.6327, 3.8569, ARRAY['GLP-1', 'Diabète', 'Nutrition', 'Obésité'], ARRAY['Français', 'Anglais'],
 true, '75-110€', 'Université Montpellier',
 ARRAY['DES Endocrinologie', 'DIU Nutrition Clinique'], 17, true,
 'Hôpital public', 'CHU Lapeyronie', 'CHU',
 true, true, 'dr-isabelle-fabre-diabetologue-montpellier', 'Dr Isabelle Fabre, diabétologue nutritionniste Montpellier. Experte GLP-1 et obésité au CHU Lapeyronie.'),

-- Strasbourg
('Thomas', 'Weber', 'Dr.', 'Endocrinologue', '03.88.11.22.33', 't.weber@chru-strasbourg.fr', 'https://chru-strasbourg.fr',
 '1 Place de l''Hôpital', 'Strasbourg', '67091', 'Bas-Rhin', 'Grand Est',
 48.5734, 7.7521, ARRAY['GLP-1', 'Diabète'], ARRAY['Français', 'Allemand'],
 true, '80-110€', 'Université de Strasbourg',
 ARRAY['DES Endocrinologie', 'Certification européenne diabète'], 19, true,
 'Hôpital public', 'Hôpitaux Universitaires de Strasbourg', 'CHU',
 true, false, 'dr-thomas-weber-endocrinologue-strasbourg', 'Dr Thomas Weber, endocrinologue Strasbourg. Spécialiste GLP-1 aux HUS.'),

-- Bordeaux
('Claire', 'Dufour', 'Dr.', 'Endocrinologue', '05.56.79.48.37', 'c.dufour@chu-bordeaux.fr', 'https://chu-bordeaux.fr',
 'Place Amélie Raba Léon', 'Bordeaux', '33076', 'Gironde', 'Nouvelle-Aquitaine',
 44.8378, -0.5792, ARRAY['GLP-1', 'Diabète', 'Obésité'], ARRAY['Français', 'Anglais'],
 true, '75-105€', 'Université de Bordeaux',
 ARRAY['DES Endocrinologie', 'Formation GLP-1 avancée'], 12, true,
 'Hôpital public', 'CHU de Bordeaux', 'CHU',
 true, true, 'dr-claire-dufour-endocrinologue-bordeaux', 'Dr Claire Dufour, endocrinologue Bordeaux. Consultations GLP-1 et obésité au CHU de Bordeaux.');

-- Mise à jour des compteurs
SELECT update_city_professionals_count();
