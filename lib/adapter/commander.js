'use strict';

module.exports = {
  args: args,
  help: help,
  options: options
};

function parse(provider) {
  if (typeof provider.config !== 'object') {
    provider.parse(process.argv);
  }
  return provider;
}

function args(provider) {
  return parse(provider).args;
}

function help(provider) {
  provider.outputHelp();
}

function options(provider) {
  return parse(provider);
}

