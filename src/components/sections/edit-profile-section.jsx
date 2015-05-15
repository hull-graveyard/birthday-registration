'use strict';

import React from 'react';
import { translate } from '../../lib/i18n';
import Form from '../form';
import t from '../form/t';
import AsyncActionsMixin from '../../mixins/async-actions';
import _ from 'underscore';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default React.createClass({
  displayName: 'LogInSection',

  mixins: [
    AsyncActionsMixin
  ],

  getAsyncActions() {
    return {
      updateProfile: this.props.updateProfile
    };
  },

  getType() {
    return t.struct({
      month: t.enums.of(MONTHS),
      day: t.Num,
      year: t.Num
    });
  },

  getFields() {
    return {
      month: {
        nullOption: false,
        value: 1,
        options: _.map(MONTHS, (m, i) => {
          return { value: i + 1, text: translate(m) }
        })
      },
      day: {
        placeholder: translate('Day'),
      },
      year: {
        placeholder: translate('Year'),
      }
    };
  },

  handleLogOut(e) {
    e.preventDefault();

    this.props.logOut();
    this.props.hideDialog();
  },

  handleSubmit(value) {
    this.getAsyncAction('updateProfile')(value);
  },

  render() {
    let button = translate('Complete');
    let disabled = false;

    if (this.state.updateProfileState === 'pending') {
      button = translate('Saving...');
      disabled = true;
    }

    return (
      <div className='hull-section hull-section-edit-profile'>
        <div className='hull-section-header'>
          <h1>{translate('Just one more step...')}</h1>
        </div>
        <div className='hull-section-content'>
          <Form type={this.getType()} fields={this.getFields()} value={this.props.userBirthday} submitMessage={button} onSubmit={this.handleSubmit} disabled={disabled} />
        </div>
      </div>
    );
  }
});

