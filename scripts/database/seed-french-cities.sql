-- Insertion des principales villes françaises
INSERT INTO french_cities (name, department, region, postal_code, latitude, longitude, population, slug) VALUES
-- Île-de-France
('Paris', '75', 'Île-de-France', '75000', 48.8566, 2.3522, 2161000, 'paris'),
('Boulogne-Billancourt', '92', 'Île-de-France', '92100', 48.8414, 2.2395, 121583, 'boulogne-billancourt'),
('Saint-Denis', '93', 'Île-de-France', '93200', 48.9362, 2.3574, 111103, 'saint-denis'),
('Argenteuil', '95', 'Île-de-France', '95100', 48.9474, 2.2484, 110468, 'argenteuil'),
('Montreuil', '93', 'Île-de-France', '93100', 48.8644, 2.4394, 109914, 'montreuil'),

-- Auvergne-Rhône-Alpes
('Lyon', '69', 'Auvergne-Rhône-Alpes', '69000', 45.7640, 4.8357, 515695, 'lyon'),
('Grenoble', '38', 'Auvergne-Rhône-Alpes', '38000', 45.1885, 5.7245, 158552, 'grenoble'),
('Villeurbanne', '69', 'Auvergne-Rhône-Alpes', '69100', 45.7661, 4.8794, 149019, 'villeurbanne'),
('Saint-Étienne', '42', 'Auvergne-Rhône-Alpes', '42000', 45.4397, 4.3872, 171057, 'saint-etienne'),

-- Provence-Alpes-Côte d''Azur
('Marseille', '13', 'Provence-Alpes-Côte d''Azur', '13000', 43.2965, 5.3698, 861635, 'marseille'),
('Nice', '06', 'Provence-Alpes-Côte d''Azur', '06000', 43.7102, 7.2620, 342637, 'nice'),
('Toulon', '83', 'Provence-Alpes-Côte d''Azur', '83000', 43.1242, 5.9280, 171953, 'toulon'),
('Aix-en-Provence', '13', 'Provence-Alpes-Côte d''Azur', '13100', 43.5297, 5.4474, 143006, 'aix-en-provence'),

-- Occitanie
('Toulouse', '31', 'Occitanie', '31000', 43.6047, 1.4442, 471941, 'toulouse'),
('Montpellier', '34', 'Occitanie', '34000', 43.6110, 3.8767, 285121, 'montpellier'),
('Nîmes', '30', 'Occitanie', '30000', 43.8367, 4.3601, 151001, 'nimes'),
('Perpignan', '66', 'Occitanie', '66000', 42.6986, 2.8954, 121934, 'perpignan'),

-- Nouvelle-Aquitaine
('Bordeaux', '33', 'Nouvelle-Aquitaine', '33000', 44.8378, -0.5792, 254436, 'bordeaux'),
('Limoges', '87', 'Nouvelle-Aquitaine', '87000', 45.8336, 1.2611, 132175, 'limoges'),
('Poitiers', '86', 'Nouvelle-Aquitaine', '86000', 46.5802, 0.3404, 88665, 'poitiers'),
('Pau', '64', 'Nouvelle-Aquitaine', '64000', 43.2951, -0.3712, 77251, 'pau'),

-- Grand Est
('Strasbourg', '67', 'Grand Est', '67000', 48.5734, 7.7521, 280966, 'strasbourg'),
('Metz', '57', 'Grand Est', '57000', 49.1193, 6.1757, 116429, 'metz'),
('Nancy', '54', 'Grand Est', '54000', 48.6921, 6.1844, 104885, 'nancy'),
('Reims', '51', 'Grand Est', '51100', 49.2583, 4.0317, 182211, 'reims'),

-- Hauts-de-France
('Lille', '59', 'Hauts-de-France', '59000', 50.6292, 3.0573, 232787, 'lille'),
('Amiens', '80', 'Hauts-de-France', '80000', 49.8942, 2.2957, 133448, 'amiens'),
('Roubaix', '59', 'Hauts-de-France', '59100', 50.6942, 3.1746, 96990, 'roubaix'),
('Tourcoing', '59', 'Hauts-de-France', '59200', 50.7236, 3.1609, 97476, 'tourcoing'),

-- Pays de la Loire
('Nantes', '44', 'Pays de la Loire', '44000', 47.2184, -1.5536, 309346, 'nantes'),
('Le Mans', '72', 'Pays de la Loire', '72000', 48.0061, 0.1996, 143240, 'le-mans'),
('Angers', '49', 'Pays de la Loire', '49000', 47.4784, -0.5632, 151520, 'angers'),
('Saint-Nazaire', '44', 'Pays de la Loire', '44600', 47.2731, -2.2137, 68640, 'saint-nazaire'),

-- Bretagne
('Rennes', '35', 'Bretagne', '35000', 48.1173, -1.6778, 217728, 'rennes'),
('Brest', '29', 'Bretagne', '29200', 48.3905, -4.4860, 139456, 'brest'),
('Quimper', '29', 'Bretagne', '29000', 47.9960, -4.1026, 63849, 'quimper'),
('Lorient', '56', 'Bretagne', '56100', 47.7482, -3.3630, 57149, 'lorient'),

-- Normandie
('Le Havre', '76', 'Normandie', '76600', 49.4944, 0.1079, 170147, 'le-havre'),
('Rouen', '76', 'Normandie', '76000', 49.4431, 1.0993, 110145, 'rouen'),
('Caen', '14', 'Normandie', '14000', 49.1829, -0.3707, 105512, 'caen'),
('Cherbourg-en-Cotentin', '50', 'Normandie', '50100', 49.6407, -1.6161, 79144, 'cherbourg-en-cotentin'),

-- Centre-Val de Loire
('Orléans', '45', 'Centre-Val de Loire', '45000', 47.9029, 1.9039, 116238, 'orleans'),
('Tours', '37', 'Centre-Val de Loire', '37000', 47.3941, 0.6848, 136463, 'tours'),
('Bourges', '18', 'Centre-Val de Loire', '18000', 47.0810, 2.3987, 64668, 'bourges'),
('Blois', '41', 'Centre-Val de Loire', '41000', 47.5859, 1.3350, 45903, 'blois'),

-- Bourgogne-Franche-Comté
('Dijon', '21', 'Bourgogne-Franche-Comté', '21000', 47.3220, 5.0415, 155090, 'dijon'),
('Besançon', '25', 'Bourgogne-Franche-Comté', '25000', 47.2378, 6.0241, 117030, 'besancon'),
('Belfort', '90', 'Bourgogne-Franche-Comté', '90000', 47.6383, 6.8628, 46443, 'belfort'),
('Chalon-sur-Saône', '71', 'Bourgogne-Franche-Comté', '71100', 46.7811, 4.8578, 44985, 'chalon-sur-saone'),

-- Corse
('Ajaccio', '2A', 'Corse', '20000', 41.9278, 8.7369, 68918, 'ajaccio'),
('Bastia', '2B', 'Corse', '20200', 42.7028, 9.4504, 47562, 'bastia'),

-- Outre-mer (exemples)
('Fort-de-France', '972', 'Martinique', '97200', 14.6118, -61.0809, 78132, 'fort-de-france'),
('Pointe-à-Pitre', '971', 'Guadeloupe', '97110', 16.2333, -61.5333, 16267, 'pointe-a-pitre'),
('Saint-Denis', '974', 'La Réunion', '97400', -20.8823, 55.4504, 147920, 'saint-denis-reunion'),
('Cayenne', '973', 'Guyane', '97300', 4.9367, -52.3261, 61550, 'cayenne'),
('Nouméa', '988', 'Nouvelle-Calédonie', '98800', -22.2758, 166.4581, 99926, 'noumea');
