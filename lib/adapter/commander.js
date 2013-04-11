module.exports = {
  args: args,
  options: options
};

function args(provider) {
  return provider.args;
}

function options(provider) {
  return provider;
}

