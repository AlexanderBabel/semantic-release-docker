const execa = require("execa");
const getImage = require("./get-image");

/**
 * @typedef {import('./index').Context} Context
 */
/**
 * Docker login.
 *
 * @param {Object} pluginConfig - The plugin configuration.
 * @param {Context} context - The semantic-release context.
 * @returns {Promise} A `Promise` that resolve to docker login command.
 */
module.exports = async (pluginConfig, { logger }) => {
  for (const envVar of ["CI_REGISTRY_PASSWORD"]) {
    // eslint-disable-next-line security/detect-object-injection
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is not set`);
    }
  }

  try {
    if (process.env.CI_USE_KANIKO_AND_CRANE === "true") {
      await execa(
        "crane",
        [
          "auth",
          "login",
          "-u=" + process.env.CI_REGISTRY_USER || "AlexanderBabel",
          "-p=" + process.env.CI_REGISTRY_PASSWORD,
          process.env.CI_REGISTRY || "containers.pkg.github.com",
        ],
        { stdio: "inherit" }
      );
    } else {
      await execa(
        "docker",
        [
          "login",
          "-u=" + process.env.CI_REGISTRY_USER || "AlexanderBabel",
          "-p=" + process.env.CI_REGISTRY_PASSWORD,
          process.env.CI_REGISTRY || "containers.pkg.github.com",
        ],
        { stdio: "inherit" }
      );
    }
  } catch (err) {
    throw new Error("docker login failed");
  }

  if (pluginConfig.buildArgs && !(pluginConfig.buildArgs instanceof Array)) {
    throw new Error("plugin config contains invalid buildArgs!");
  }

  if (!getImage(pluginConfig)) {
    throw new Error(
      "Could not find image name. You can use CI_REGISTRY_IMAGE to define it!"
    );
  }
};