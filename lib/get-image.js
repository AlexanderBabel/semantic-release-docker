module.exports = function getImage(pluginConfig) {
  if (pluginConfig && pluginConfig.image) {
    return pluginConfig.image.toLowerCase();
  }

  if (process.env.CI_REGISTRY_IMAGE) {
    return process.env.CI_REGISTRY_IMAGE.toLowerCase();
  }

  if (process.env.GITHUB_REPOSITORY) {
    const registry = process.env.CI_REGISTRY || "containers.pkg.github.com";
    return `${registry}/${process.env.GITHUB_REPOSITORY}`.toLowerCase();
  }
};
