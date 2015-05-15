'use strict';

import React from 'react';
import { translate } from '../../lib/i18n';
import SocialButtons from '../social-buttons';

export default React.createClass({
  displayName: 'SignUpSection',

  render() {
    return (
      <div className='hull-section hull-section-sign-up'>
        <div className='hull-section-header'>
          <h1>{translate('Birthday Strap Registration')}</h1>
          <p>{translate('Register with us through Facebook and on your next birthday we will send you a code to order any Shore Project strap for free!')}</p>
        </div>

        <div className='hull-section-content'>
          <SocialButtons {...this.props} />
        </div>

        <div className='hull-section-footer'>
          <p>{translate("By signing up, you agree to {organization}'s Terms of Service.", { organization: this.props.organization.name })}</p>
        </div>
      </div>
    );
  }
});

