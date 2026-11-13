/**
 * Couche « réservation » de Marolaka Eiffel.
 *
 * La page ne parle jamais directement à un système de réservation : elle passe par
 * window.BookingService. Pour brancher plus tard un vrai moteur (calendrier, disponibilités,
 * choix de chambre, gestion des réservations), il suffit d'enregistrer un nouveau
 * « fournisseur » ici et de changer SITE_CONFIG.booking.provider — le design ne bouge pas.
 *
 * Contrat d'un fournisseur :
 *   submit(request) -> Promise<Result>
 *     request = { arrival: 'AAAA-MM-JJ', departure: 'AAAA-MM-JJ', guests: Number, guestsLabel: String, roomId?: String }
 *     Result  = { type: 'contact', summary, emailHref, phoneHref }   // ouvre la fenêtre actuelle
 *             | { type: 'redirect', url }                          // ex. page du moteur de réservation
 */
(function () {
  'use strict';

  var config = window.SITE_CONFIG || {};
  var contact = config.contact || {};
  var providers = {};

  function parseDate(value) {
    return new Date(value + 'T12:00:00');
  }

  function formatDate(value) {
    return parseDate(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function nights(request) {
    return Math.round((parseDate(request.departure) - parseDate(request.arrival)) / 86400000);
  }

  function findRoom(id) {
    return (config.rooms || []).filter(function (room) { return room.id === id; })[0] || null;
  }

  function buildSummary(request) {
    var summary = 'Du ' + formatDate(request.arrival) + ' au ' + formatDate(request.departure) + ' · ' + request.guestsLabel;
    var room = request.roomId && findRoom(request.roomId);
    return room ? summary + ' · ' + room.name : summary;
  }

  /** Fournisseur actuel : demande de réservation par e-mail (aucun serveur nécessaire). */
  providers.email = {
    submit: function (request) {
      var summary = buildSummary(request);
      var subject = 'Demande de réservation — Marolaka Eiffel';
      var body = 'Bonjour, je souhaite connaître vos disponibilités.\n' + summary +
        ' (' + nights(request) + ' nuit' + (nights(request) > 1 ? 's' : '') + ')';
      return Promise.resolve({
        type: 'contact',
        summary: summary,
        emailHref: 'mailto:' + contact.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body),
        phoneHref: 'tel:' + contact.phone
      });
    }
  };

  window.BookingService = {
    /** Ajoute un fournisseur (ex. moteur de réservation) sans toucher au reste du site. */
    registerProvider: function (name, provider) {
      providers[name] = provider;
    },

    /** Vérifie les dates et renvoie un message d'erreur, ou null si la demande est valide. */
    validate: function (request) {
      if (!request.arrival) return { field: 'arrival', message: 'Veuillez choisir votre date d’arrivée.' };
      if (!request.departure) return { field: 'departure', message: 'Veuillez choisir votre date de départ.' };
      if (request.departure <= request.arrival) return { field: 'departure', message: 'Veuillez choisir une date après votre arrivée.' };
      return null;
    },

    submit: function (request) {
      var name = (config.booking && config.booking.provider) || 'email';
      var provider = providers[name] || providers.email;
      return provider.submit(request);
    },

    formatDate: formatDate,
    rooms: function () { return (config.rooms || []).slice(); }
  };
})();
