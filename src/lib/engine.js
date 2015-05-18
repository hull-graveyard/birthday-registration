import assign from 'object-assign';
import { EventEmitter } from 'events';

function parseFacebookBirthday(birthday) {
  if (typeof birthday !== 'string') { return {}; }

  const parts = birthday.split('/');

  if (parts.length === 1) {
    return { year: parts[0] }
  } else if (parts.length === 2 || parts.length === 3) {
    return { month: parts[0], day: parts[1], year: parts[2] }
  } else {
    return {};
  }
}

const USER_SECTIONS = [
  'thanks',
  'editProfile'
];

const VISITOR_SECTIONS = [
  'signUp',
];

const SECTIONS = USER_SECTIONS.concat(VISITOR_SECTIONS);

const ACTIONS = [
  'logIn',
  'updateBirthday',
];

const METHODS = {
  login: 'logIn',
  logout: 'logOut',
  signup: 'signUp'
};

const STATUS = {
  logIn: 'isLoggingIn',
  logOut: 'isLoggingOut',
  linkIdentity: 'isLinking',
  unlinkIdentity: 'isUnlinking'
};

const EVENT = 'CHANGE';

function Engine(deployment) {
  this._ship = deployment.ship;
  this._platform = deployment.platform;
  this._settings = deployment.settings;
  this._organization = deployment.organization;
  this._form = this._ship.resources.profile_form;

  this.resetState();
  this.resetUser();

  Hull.on('hull.user.**', (user) => {
    // Ignore the events that come from actions.
    if (this.isWorking()) { return; }

    let nextUser = user || {};
    let previousUser = this._user || {};

    if (nextUser.id !== previousUser.id) { this.fetchShip(); }
  });

  this.emitChange();
}

assign(Engine.prototype, EventEmitter.prototype, {
  getActions() {
    if (this._actions) { return this._actions; }

    this._actions = ACTIONS.reduce((m, a) => {
      m[a] = this[a].bind(this);
      return m;
    }, {});

    return this._actions;
  },

  getState() {
    return {
      user: this._user,
      settings: this._settings,
      shipSettings: this._ship.settings,
      organization: this._organization,
      platform: this._platform,
      ship: this._ship,
      form: this._form,
      formIsSubmitted: this.formIsSubmitted(),
      identities: this._identities,
      providers: this.getProviders(),
      errors: this._errors,
      isWorking: this.isWorking(),
      isLoggingIn: this._isLoggingIn,
      isLoggingOut: this._isLoggingOut,
      isLinking: this._isLinking,
      isUnlinking: this._isUnlinking,
      activeSection: this.getActiveSection(),
      userBirthday: this._userBirthday
    };
  },

  addChangeListener(listener) {
    this.addListener(EVENT, listener)
  },

  removeChangeListener(listener) {
    this.removeListener(EVENT, listener);
  },

  emitChange() {
    this.emit(EVENT);
  },

  resetState() {
    this.resetUser();

    this._errors = {};
    this._isLoggingIn = false;
    this._isLoggingOut = false;
    this._isLinking = false;
    this._isUnlinking = false;
    this._dialogIsVisible = false;
    this._activeSection = 'signUp';
  },

  resetUser() {
    this._user = Hull.currentUser();

    let identities = {}
    if (this._user != null) {
      this._user.identities.forEach(function(identity) {
        identities[identity.provider] = true;
      });
    }

    this._identities = identities;
  },

  fetchShip() {
    // As today Hull.api calls cannot be aborted... So I set an ID to every
    // fetchShip calls to be sure to execute the callback only when the last
    // Hull.api call is resolved.
    let id = (this._fetchShipPromiseId || 0) + 1;
    this._fetchShipPromiseId = id;

    return Hull.api(this._ship.id).then((ship) => {
      if (id !== this._fetchShipPromiseId) { return; }

      this._ship = ship;
      this._form = this._ship.resources.profile_form;

      this.resetUser();
      this.emitChange();
    });
  },

  getProviders() {
    let provider = { name: 'facebook' };
    provider.isLinked = !!this._identities['facebook'];
    provider.isUnlinkable = provider.isLinked && this._user.main_identity !== 'facebook';

    return [provider];
  },

  getActiveSection() {
    let sections;
    let defaultSection;

    if (this._user) {
      if (!this.formIsSubmitted()) { return 'editProfile'; }

      sections = USER_SECTIONS;
      defaultSection = 'thanks';
    } else {
      sections = VISITOR_SECTIONS;
      defaultSection = sections[0];
    }

    return sections.indexOf(this._activeSection) > -1 ? this._activeSection : defaultSection;
  },

  logIn(providerOrCredentials) {
    return this.perform('login', providerOrCredentials).then((user) => {
      return this.fetchFacebookBirthday();
    }).then((b) => {
      this._userBirthday = b;

      if (b.month && b.day && b.year) {
        return this.updateBirthday(b).then(() => this.fetchShip());
      } else {
        return this.fetchShip();
      }
    });
  },

  fetchFacebookBirthday() {
    return Hull.api({ provider: 'facebook', path: 'me' }).then((r) => {
      return parseFacebookBirthday(r.birthday);
    })
  },

  linkIdentity(provider) {
    return this.perform('linkIdentity', provider).then(() => {
      this.resetUser();
      this.emitChange();
    });
  },

  unlinkIdentity(provider) {
    return this.perform('unlinkIdentity', provider).then(() => {
      this.resetUser();
      this.emitChange();
    });
  },

  perform(method, provider) {
    let options;
    if (typeof provider === 'string') {
      options = { provider: provider };
    } else {
      options = assign({}, provider);
      provider = 'classic';
    }

    const s = STATUS[METHODS[method]];

    this['_' + s] = provider;
    this._errors = {};

    this.emitChange();

    let promise = Hull[method](options);

    promise.then(() => {
      this['_' + s] = false;
      this._errors = {};

      this.emitChange();
    }, (error) => {
      this['_' + s] = false;

      error.provider = provider;
      let m = METHODS[method] || method;
      this._errors[m] = error;

      this.emitChange();
    });

    return promise;
  },

  updateBirthday(birthday) {
    const data = {
      birthday: `${birthday.year}-${birthday.month}-${birthday.day}`
    };

    let r = Hull.api(this._form.id + '/submit' ,'put', { data });

    r.then((form) => {
      this._form = form;
      this._activeSection = 'thanks';

      this.emitChange();
    });

    return r;
  },

  formIsSubmitted() {
    return this._form.user_data && !!this._form.user_data.created_at;
  },

  isWorking() {
    return this._isLoggingIn || this._isLoggingOut || this._isLinking || this._isUnlinking;
  }
});

module.exports = Engine;

