const execa = require('execa')

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
  const { buildArgs } = pluginConfig
  const image = (process.env.CI_REGISTRY_IMAGE || '').toLowerCase()

  try {
    await execa(
      'docker',
      ['build', '-t', `${image}:latest`, ...(buildArgs || []), '.'],
      {
        stdio: 'inherit'
      }
    )
  } catch (err) {
    throw new Error('docker build failed')
  }
}
