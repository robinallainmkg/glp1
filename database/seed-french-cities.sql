-- Insertion des principales villes françaises avec priorité SEO
INSERT INTO french_cities (name, postal_code, department, department_code, region, population, latitude, longitude, slug, seo_priority) VALUES
-- Grandes métropoles (Priorité 1 - Haute)
('Paris', '75001', 'Paris', '75', 'Île-de-France', 2161000, 48.8566, 2.3522, 'paris', 1),
('Marseille', '13001', 'Bouches-du-Rhône', '13', 'Provence-Alpes-Côte d''Azur', 861635, 43.2965, 5.3698, 'marseille', 1),
('Lyon', '69001', 'Rhône', '69', 'Auvergne-Rhône-Alpes', 515695, 45.7640, 4.8357, 'lyon', 1),
('Toulouse', '31000', 'Haute-Garonne', '31', 'Occitanie', 471941, 43.6047, 1.4442, 'toulouse', 1),
('Nice', '06000', 'Alpes-Maritimes', '06', 'Provence-Alpes-Côte d''Azur', 342295, 43.7102, 7.2620, 'nice', 1),
('Nantes', '44000', 'Loire-Atlantique', '44', 'Pays de la Loire', 309346, 47.2184, -1.5536, 'nantes', 1),
('Montpellier', '34000', 'Hérault', '34', 'Occitanie', 285121, 43.6110, 3.8767, 'montpellier', 1),
('Strasbourg', '67000', 'Bas-Rhin', '67', 'Grand Est', 280966, 48.5734, 7.7521, 'strasbourg', 1),
('Bordeaux', '33000', 'Gironde', '33', 'Nouvelle-Aquitaine', 254436, 44.8378, -0.5792, 'bordeaux', 1),
('Lille', '59000', 'Nord', '59', 'Hauts-de-France', 232741, 50.6292, 3.0573, 'lille', 1),

-- Grandes villes (Priorité 1)
('Rennes', '35000', 'Ille-et-Vilaine', '35', 'Bretagne', 217728, 48.1173, -1.6778, 'rennes', 1),
('Reims', '51100', 'Marne', '51', 'Grand Est', 182460, 49.2583, 4.0317, 'reims', 1),
('Saint-Étienne', '42000', 'Loire', '42', 'Auvergne-Rhône-Alpes', 171924, 45.4397, 4.3872, 'saint-etienne', 1),
('Le Havre', '76600', 'Seine-Maritime', '76', 'Normandie', 170147, 49.4944, 0.1079, 'le-havre', 1),
('Toulon', '83000', 'Var', '83', 'Provence-Alpes-Côte d''Azur', 169634, 43.1242, 5.9280, 'toulon', 1),
('Grenoble', '38000', 'Isère', '38', 'Auvergne-Rhône-Alpes', 158180, 45.1885, 5.7245, 'grenoble', 1),
('Dijon', '21000', 'Côte-d''Or', '21', 'Bourgogne-Franche-Comté', 155090, 47.3220, 5.0415, 'dijon', 1),
('Angers', '49000', 'Maine-et-Loire', '49', 'Pays de la Loire', 152960, 47.4784, -0.5632, 'angers', 1),
('Nîmes', '30000', 'Gard', '30', 'Occitanie', 148561, 43.8367, 4.3601, 'nimes', 1),
('Villeurbanne', '69100', 'Rhône', '69', 'Auvergne-Rhône-Alpes', 147712, 45.7665, 4.8818, 'villeurbanne', 1),

-- Villes moyennes importantes (Priorité 2)
('Le Mans', '72000', 'Sarthe', '72', 'Pays de la Loire', 143240, 48.0061, 0.1996, 'le-mans', 2),
('Aix-en-Provence', '13100', 'Bouches-du-Rhône', '13', 'Provence-Alpes-Côte d''Azur', 142482, 43.5297, 5.4474, 'aix-en-provence', 2),
('Clermont-Ferrand', '63000', 'Puy-de-Dôme', '63', 'Auvergne-Rhône-Alpes', 141569, 45.7772, 3.0870, 'clermont-ferrand', 2),
('Brest', '29200', 'Finistère', '29', 'Bretagne', 139456, 48.3904, -4.4861, 'brest', 2),
('Tours', '37000', 'Indre-et-Loire', '37', 'Centre-Val de Loire', 136463, 47.3941, 0.6848, 'tours', 2),
('Limoges', '87000', 'Haute-Vienne', '87', 'Nouvelle-Aquitaine', 133024, 45.8336, 1.2611, 'limoges', 2),
('Amiens', '80000', 'Somme', '80', 'Hauts-de-France', 132727, 49.8941, 2.2957, 'amiens', 2),
('Annecy', '74000', 'Haute-Savoie', '74', 'Auvergne-Rhône-Alpes', 128199, 45.8992, 6.1294, 'annecy', 2),
('Perpignan', '66000', 'Pyrénées-Orientales', '66', 'Occitanie', 121875, 42.6886, 2.8948, 'perpignan', 2),
('Besançon', '25000', 'Doubs', '25', 'Bourgogne-Franche-Comté', 117599, 47.2378, 6.0241, 'besancon', 2),

-- Villes moyennes (Priorité 2)
('Metz', '57000', 'Moselle', '57', 'Grand Est', 116429, 49.1193, 6.1757, 'metz', 2),
('Orléans', '45000', 'Loiret', '45', 'Centre-Val de Loire', 116238, 47.9029, 1.9093, 'orleans', 2),
('Mulhouse', '68100', 'Haut-Rhin', '68', 'Grand Est', 108942, 47.7508, 7.3359, 'mulhouse', 2),
('Rouen', '76000', 'Seine-Maritime', '76', 'Normandie', 110145, 49.4431, 1.0993, 'rouen', 2),
('Caen', '14000', 'Calvados', '14', 'Normandie', 105512, 49.1829, -0.3707, 'caen', 2),
('Nancy', '54000', 'Meurthe-et-Moselle', '54', 'Grand Est', 104885, 48.6921, 6.1844, 'nancy', 2),
('Argenteuil', '95100', 'Val-d''Oise', '95', 'Île-de-France', 110388, 48.9473, 2.2486, 'argenteuil', 2),
('Roubaix', '59100', 'Nord', '59', 'Hauts-de-France', 95721, 50.6942, 3.1746, 'roubaix', 2),
('Tourcoing', '59200', 'Nord', '59', 'Hauts-de-France', 97476, 50.7236, 3.1609, 'tourcoing', 2),
('Montreuil', '93100', 'Seine-Saint-Denis', '93', 'Île-de-France', 109914, 48.8614, 2.4444, 'montreuil', 2),

-- Petites villes stratégiques (Priorité 3)
('Avignon', '84000', 'Vaucluse', '84', 'Provence-Alpes-Côte d''Azur', 92209, 43.9493, 4.8059, 'avignon', 3),
('Poitiers', '86000', 'Vienne', '86', 'Nouvelle-Aquitaine', 88776, 46.5802, 0.3404, 'poitiers', 3),
('Dunkerque', '59140', 'Nord', '59', 'Hauts-de-France', 86279, 51.0342, 2.3770, 'dunkerque', 3),
('Pau', '64000', 'Pyrénées-Atlantiques', '64', 'Nouvelle-Aquitaine', 77251, 43.2951, -0.3708, 'pau', 3),
('Calais', '62100', 'Pas-de-Calais', '62', 'Hauts-de-France', 72509, 50.9581, 1.8503, 'calais', 3),
('La Rochelle', '17000', 'Charente-Maritime', '17', 'Nouvelle-Aquitaine', 76810, 46.1603, -1.1511, 'la-rochelle', 3),
('Bourges', '18000', 'Cher', '18', 'Centre-Val de Loire', 64668, 47.0810, 2.3987, 'bourges', 3),
('Lorient', '56100', 'Morbihan', '56', 'Bretagne', 57567, 47.7482, -3.3700, 'lorient', 3),
('Bayonne', '64100', 'Pyrénées-Atlantiques', '64', 'Nouvelle-Aquitaine', 51228, 43.4928, -1.4748, 'bayonne', 3),
('Vannes', '56000', 'Morbihan', '56', 'Bretagne', 54020, 47.6583, -2.7603, 'vannes', 3);

-- Mise à jour des slugs pour éviter les conflits
UPDATE french_cities SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '''', ''), 'œ', 'oe'));
