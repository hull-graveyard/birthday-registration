import React from 'react';
import Engine from './lib/engine';
import { setTranslations } from './lib/i18n';
import Ship from './components/ship';

export default function(element, deployment) {
  console.log('BOOTSTRAP', element, deployment);

  let engine = new Engine(deployment);

  setTranslations(deployment.ship.translations);

  React.render(<Ship engine={engine} actions={engine.getActions()} />, element);
};

