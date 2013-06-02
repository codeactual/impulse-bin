module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('initConfig.projName', 'impulse-bin')
    .demand('initConfig.instanceName', 'impulseBin')
    .demand('initConfig.klassName', 'ImpulseBin')
    .loot('node-component-grunt')
    .attack();
};
