/**
 * Service de gestion des formulaires de contact
 * Compatible avec le mode statique d'Astro
 */

// Configuration du service externe (Formspree ou similaire)
const CONTACT_CONFIG = {
  // Remplacez par votre endpoint Formspree ou autre service
  endpoint: 'https://formspree.io/f/mqazvjby', // Endpoint temporaire de test
  fallbackEmail: 'robinallainmkg@gmail.com'
};

/**
 * Envoie les données du formulaire de contact
 * @param {FormData} formData - Les données du formulaire
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export async function submitContactForm(formData) {
  try {
    // Préparation des données pour Formspree
    const formParams = new URLSearchParams();
    
    // Conversion des données du formulaire
    for (const [key, value] of formData.entries()) {
      if (key === 'concerns') {
        // Gestion des checkboxes multiples
        const existingConcerns = formParams.get('concerns') || '';
        formParams.set('concerns', existingConcerns ? `${existingConcerns}, ${value}` : value);
      } else {
        formParams.set(key, value);
      }
    }
    
    // Ajout de métadonnées
    formParams.set('_subject', `Nouveau message de contact - ${formParams.get('subject') || 'Sans sujet'}`);
    formParams.set('_replyto', formParams.get('email'));
    formParams.set('_format', 'plain');
    
    console.log('📧 Envoi vers service externe...');
    console.log('Données:', Object.fromEntries(formParams.entries()));
    
    // Envoi vers le service externe
    const response = await fetch(CONTACT_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formParams.toString()
    });
    
    if (response.ok) {
      console.log('✅ Message envoyé avec succès');
      return {
        success: true,
        message: 'Message envoyé avec succès'
      };
    } else {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error);
    
    // Fallback : créer un lien mailto
    const mailtoData = {
      to: CONTACT_CONFIG.fallbackEmail,
      subject: formData.get('subject') || 'Message de contact',
      body: createEmailBody(formData)
    };
    
    return {
      success: false,
      error: error.message,
      fallback: 'mailto',
      mailtoLink: createMailtoLink(mailtoData)
    };
  }
}

/**
 * Crée le corps de l'email à partir des données du formulaire
 */
function createEmailBody(formData) {
  let body = `Nouveau message de contact\n\n`;
  
  body += `Nom: ${formData.get('name') || 'Non renseigné'}\n`;
  body += `Email: ${formData.get('email') || 'Non renseigné'}\n`;
  body += `Téléphone: ${formData.get('phone') || 'Non renseigné'}\n`;
  body += `Âge: ${formData.get('age') || 'Non renseigné'}\n`;
  body += `Sujet: ${formData.get('subject') || 'Non renseigné'}\n`;
  body += `Traitement: ${formData.get('treatment') || 'Non renseigné'}\n`;
  
  // Préoccupations
  const concerns = [];
  const formDataEntries = Array.from(formData.entries());
  formDataEntries.forEach(([key, value]) => {
    if (key === 'concerns') {
      concerns.push(value);
    }
  });
  body += `Préoccupations: ${concerns.join(', ') || 'Aucune'}\n`;
  
  body += `Newsletter: ${formData.get('newsletter') === 'yes' ? 'Oui' : 'Non'}\n\n`;
  body += `Message:\n${formData.get('message') || 'Aucun message'}\n\n`;
  body += `---\nEnvoyé depuis le site GLP-1 France\n`;
  
  return body;
}

/**
 * Crée un lien mailto
 */
function createMailtoLink(data) {
  const params = new URLSearchParams({
    subject: data.subject,
    body: data.body
  });
  
  return `mailto:${data.to}?${params.toString()}`;
}
