'use strict';

import React from 'react';
import sections from './sections';

export default React.createClass({
  displayName: 'Ship',

  getInitialState() {
    return this.props.engine.getState();
  },

  componentWillMount() {
    this.props.engine.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    this.props.engine.removeChangeListener(this._onChange);
  },

  _onChange() {
    this.setState(this.props.engine.getState());
  },

  render() {
    const Section = sections[this.state.activeSection];

    return <Section {...this.state} {...this.props.actions} />
  }
});

