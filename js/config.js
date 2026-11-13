/**
 * Configuration du site Marolaka Eiffel.
 * Toutes les informations susceptibles de changer avant la mise en ligne sont réunies ici.
 */
window.SITE_CONFIG = {
  contact: {
    email: 'contact@marolakaeiffel.com',
    phone: '+261329164712',
    phoneDisplay: '+261 32 91 647 12'
  },

  booking: {
    /**
     * Mode de réservation actif.
     *  - 'email' : version actuelle. Le formulaire vérifie les dates, affiche un récapitulatif
     *              puis prépare un e-mail de demande de réservation.
     *  - Autres modes (moteur de réservation, API) : à ajouter dans js/booking.js — voir README.md.
     */
    provider: 'email',

    /** Capacité maximale proposée dans le champ « Voyageurs ». */
    maxGuests: 4
  },

  /** Catalogue des chambres, repris des cartes affichées sur la page (prix en ariary, par nuit). */
  rooms: [
    { id: 'standard', name: 'Chambre Standard', capacity: 2, beds: 1, priceFrom: 95000 },
    { id: 'superieure', name: 'Chambre Supérieure', capacity: 2, beds: 1, priceFrom: 130000 },
    { id: 'suite-familiale', name: 'Suite Familiale', capacity: 4, beds: 2, priceFrom: 180000 }
  ]
};
