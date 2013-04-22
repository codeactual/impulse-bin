module.exports = {
  args: args,
  options: options
};

function args(provider) {
  return provider._;
}

function options(provider) {
  return provider;
}

