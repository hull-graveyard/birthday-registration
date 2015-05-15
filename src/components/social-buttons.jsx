import cx from 'react/lib/cx';
import React from 'react';
import capitalize from '../lib/capitalize';
import { translate } from '../lib/i18n';

export default React.createClass({
  renderButton: function(provider, index) {
    var actionName;
    var status;
    var t;

    if (this.props.user == null) {
      actionName = 'logIn';
      status = 'isLoggingIn';
      if (this.props.activeSection === 'signUp') {
        t = ['Sign up with {provider}', 'Signing up with {provider}']
      } else {
        t = ['Log in with {provider}', 'Logging in with {provider}'];
      }
    } else if (provider.isLinked && provider.isUnlinkable) {
      actionName = 'unlinkIdentity';
      status = 'isUnlinking';
      t = ['Unlink your {provider} account', 'Unlinking {provider} account'];
    } else if (!provider.isLinked) {
      actionName = 'linkIdentity';
      status = 'isLinking';
      t = ['Link your {provider} account', 'Linking {provider} account'];
    } else {
      return;
    }

    var m = this.props[status] === provider.name ? t[1] : t[0];
    var providerName = capitalize(provider.name)
    var providerLength = this.props.providers.length;
    var wording = translate(m, { provider: providerName });

    var handler = this.props[actionName]
    handler = handler.bind(null, provider.name) || function() {};

    var isLast = this.props.providers.length === index + 1;

    const c = 'hull-button ' + ('hull-button-' + provider.name);
    return (
      <button className={c} key={provider.name} disabled={this.props.isWorking} onClick={handler}>
        {wording}
      </button>
    );
  },

  render: function() {
    return (
      <div className='hull-buttons'>{this.props.providers.map(this.renderButton, this)}</div>
    );
  }
});

