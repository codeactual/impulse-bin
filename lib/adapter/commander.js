module.exports = {
  args: args,
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

function options(provider) {
  return parse(provider);
}

