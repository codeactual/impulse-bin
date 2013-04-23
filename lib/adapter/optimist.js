module.exports = {
  args: args,
  options: options
};

function args(provider) {
  return provider.argv._;
}

function options(provider) {
  return provider.argv;
}

