'use strict';

module.exports = {
  args: args,
  help: help,
  options: options
};

function args(provider) {
  return provider.argv._;
}

function help(provider) {
  provider.showHelp();
}

function options(provider) {
  return provider.argv;
}

