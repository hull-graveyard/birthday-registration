'use strict';

import React from 'react';
import { translate } from '../../lib/i18n';

const style = {
  border: 'none',
  visibility: 'visible',
  overflow: 'hidden',
  width: 49,
  height: 20
}

const FacebookLikeButton = React.createClass({
  render() {
    if (this.props.url == null) { return <noscript />; }

    const e = encodeURIComponent(this.props.url);
    const src = 'http://www.facebook.com/v2.3/plugins/like.php?href=' + e + '&layout=button&show_faces=false&share=false&width=90&action=like';

    return <iframe className='hull-like' src={src} style={style} frameBorder='0' allowTransparency='true' allowFullscreen='true' scrolling='no' />;
  }
});

export default React.createClass({
  displayName: 'ThanksSection',

  render() {
    const o = { name: this.props.user.name }

    return (
      <div className='hull-section hull-section-thanks'>
        <div className='hull-section-header'>
          <h1>{translate('Thanks!')}</h1>
        </div>
        <div className='hull-section-content'>
          <p>{translate('Hi {name}, your registration is now complete and so we will be in touch again on your birthday!', o)}</p>
          <p>{translate('In the meantime, please do like us on Facebook.', o)}</p>

          <FacebookLikeButton url={this.props.settings.like_url} />
        </div>
      </div>
    );
  }
});
