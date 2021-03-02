const execa = require("execa");
const getImage = require("./get-image");

/**
 * @typedef {import('./index').Context} Context
 */
/**
 * Build docker image.
 *
 * @param {Object} pluginConfig - The plugin configuration.
 * @param {Context} context - The semantic-release context.
 * @returns {Promise} A `Promise` that resolve to docker push command.
 */
module.exports = async (pluginConfig, context) => {
  const { buildArgs } = pluginConfig;
  const image = getImage(pluginConfig);

  try {
    if (process.env.CI_USE_KANIKO_AND_CRANE === "true") {
      await execa(
        "executor",
        [
          `--destination=${image}:latest`,
          "--context=.",
          "--tarPath=image.tar",
          "--single-snapshot",
          "--no-push",
        ],
        { stdio: "inherit" }
      );
    } else {
      await execa(
        "docker",
        ["build", "-t", `${image}:latest`, ...(buildArgs || []), "."],
        { stdio: "inherit" }
      );
    }
  } catch (err) {
    throw new Error("docker build failed");
  }
};
