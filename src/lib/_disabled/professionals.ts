import { supabase } from './supabase.js';

// Types
export interface FrenchCity {
  id: string;
  name: string;
  department: string;
  region: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface HealthProfessional {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  specialty: string;
  sub_specialties: string[];
  hospital_clinic?: string;
  address: string;
  city_id: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  accepts_glp1: boolean;
  accepts_new_patients: boolean;
  consultation_fee?: number;
  languages: string[];
  certifications: string[];
  education: string[];
  experience_years?: number;
  bio?: string;
  profile_image?: string;
  rating: number;
  review_count: number;
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  city?: FrenchCity;
}

export interface ProfessionalReview {
  id: string;
  professional_id: string;
  patient_name?: string;
  rating: number;
  comment?: string;
  treatment_type?: string;
  verified: boolean;
  created_at: string;
}

export interface CityProfessionalStats {
  id: string;
  name: string;
  slug: string;
  postal_code: string;
  department: string;
  region: string;
  professional_count: number;
  endocrinologist_count: number;
  diabetologist_count: number;
  nutritionist_count: number;
  glp1_specialists_count: number;
  avg_rating: number;
}

// Fonctions pour les villes
export async function getAllCities(): Promise<FrenchCity[]> {
  const { data, error } = await supabase
    .from('french_cities')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  return data || [];
}

export async function getCityBySlug(slug: string): Promise<FrenchCity | null> {
  const { data, error } = await supabase
    .from('french_cities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching city by slug:', error);
    return null;
  }

  return data;
}

export async function getCitiesByRegion(region: string): Promise<FrenchCity[]> {
  const { data, error } = await supabase
    .from('french_cities')
    .select('*')
    .eq('region', region)
    .order('name');

  if (error) {
    console.error('Error fetching cities by region:', error);
    return [];
  }

  return data || [];
}

export async function getCitiesByDepartment(department: string): Promise<FrenchCity[]> {
  const { data, error } = await supabase
    .from('french_cities')
    .select('*')
    .eq('department', department)
    .order('name');

  if (error) {
    console.error('Error fetching cities by department:', error);
    return [];
  }

  return data || [];
}

// Fonctions pour les professionnels
export async function getAllProfessionals(): Promise<HealthProfessional[]> {
  const { data, error } = await supabase
    .from('health_professionals')
    .select(`
      *,
      city:french_cities(*)
    `)
    .eq('verified', true)
    .order('featured', { ascending: false })
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }

  return data || [];
}

export async function getProfessionalsByCity(citySlug: string): Promise<HealthProfessional[]> {
  const { data, error } = await supabase
    .from('health_professionals')
    .select(`
      *,
      city:french_cities(*)
    `)
    .eq('city.slug', citySlug)
    .eq('verified', true)
    .order('featured', { ascending: false })
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching professionals by city:', error);
    return [];
  }

  return data || [];
}

export async function getProfessionalsByPostalCode(postalCode: string): Promise<HealthProfessional[]> {
  const { data, error } = await supabase
    .from('health_professionals')
    .select(`
      *,
      city:french_cities(*)
    `)
    .eq('postal_code', postalCode)
    .eq('verified', true)
    .order('featured', { ascending: false })
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching professionals by postal code:', error);
    return [];
  }

  return data || [];
}

export async function getGLP1Specialists(citySlug?: string): Promise<HealthProfessional[]> {
  let query = supabase
    .from('health_professionals')
    .select(`
      *,
      city:french_cities(*)
    `)
    .eq('accepts_glp1', true)
    .eq('verified', true);

  if (citySlug) {
    query = query.eq('city.slug', citySlug);
  }

  const { data, error } = await query
    .order('featured', { ascending: false })
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching GLP-1 specialists:', error);
    return [];
  }

  return data || [];
}

export async function searchProfessionals(
  searchTerm: string,
  citySlug?: string,
  specialty?: string
): Promise<HealthProfessional[]> {
  let query = supabase
    .from('health_professionals')
    .select(`
      *,
      city:french_cities(*)
    `)
    .eq('verified', true);

  if (citySlug) {
    query = query.eq('city.slug', citySlug);
  }

  if (specialty) {
    query = query.ilike('specialty', `%${specialty}%`);
  }

  if (searchTerm) {
    query = query.or(`
      first_name.ilike.%${searchTerm}%,
      last_name.ilike.%${searchTerm}%,
      specialty.ilike.%${searchTerm}%,
      hospital_clinic.ilike.%${searchTerm}%
    `);
  }

  const { data, error } = await query
    .order('featured', { ascending: false })
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error searching professionals:', error);
    return [];
  }

  return data || [];
}

// Statistiques par ville
export async function getCityStats(): Promise<CityProfessionalStats[]> {
  const { data, error } = await supabase
    .from('city_professional_stats')
    .select('*')
    .gt('professional_count', 0)
    .order('professional_count', { ascending: false });

  if (error) {
    console.error('Error fetching city stats:', error);
    return [];
  }

  return data || [];
}

export async function getCityStatsBySlug(slug: string): Promise<CityProfessionalStats | null> {
  const { data, error } = await supabase
    .from('city_professional_stats')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching city stats by slug:', error);
    return null;
  }

  return data;
}

// Avis et notes
export async function getProfessionalReviews(professionalId: string): Promise<ProfessionalReview[]> {
  const { data, error } = await supabase
    .from('professional_reviews')
    .select('*')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data || [];
}

// Utilitaires
export function formatProfessionalName(professional: HealthProfessional): string {
  return `${professional.title} ${professional.first_name} ${professional.last_name}`;
}

export function formatAddress(professional: HealthProfessional): string {
  return `${professional.address}, ${professional.postal_code} ${professional.city?.name}`;
}

export function getSpecialtyIcon(specialty: string): string {
  if (specialty.includes('Endocrinologue')) return '🏥';
  if (specialty.includes('Diabétologue')) return '💉';
  if (specialty.includes('Nutritionniste')) return '🥗';
  if (specialty.includes('Chirurgie')) return '⚕️';
  return '👨‍⚕️';
}

export function formatConsultationFee(fee?: number): string {
  return fee ? `${fee.toFixed(0)}€` : 'Non renseigné';
}

export function getRatingStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
}
