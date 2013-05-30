module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('projName', 'impulse-bin')
    .demand('instanceName', 'impulseBin')
    .demand('klassName', 'ImpulseBin')
    .loot('node-component-grunt')
    .attack();
};
