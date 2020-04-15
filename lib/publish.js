const execa = require('execa')
const semver = require('semver')

/**
 * @typedef {import('./index').Context} Context
 */
/**
 * Tag and push new docker images with semantic versioning.
 *
 * @param {Object} pluginConfig - The plugin configuration.
 * @param {Context} context - The semantic-release context.
 * @returns {Promise} A `Promise` that resolve to docker push command.
 */
module.exports = async (pluginConfig, { nextRelease: { version }, logger }) => {
  /**
   * Tag and push docker image by version.
   *
   * @param {string} version - Tag version.
   * @returns {Promise} A `Promise` that resolve to docker push command.
   */
  async function publish (version) {
    logger.log(
      `Pushing version ${
        process.env.CI_REGISTRY_IMAGE
      }:${version} to GitLab Container Registry`
    )
    // tag image if not latest
    if (version !== 'latest') {
      await execa(
        'docker',
        [
          'tag',
          `${process.env.CI_REGISTRY_IMAGE}:latest`,
          `${process.env.CI_REGISTRY_IMAGE}:${version}`
        ],
        {
          stdio: 'inherit'
        }
      )
    }
    // push image
    await execa(
      'docker',
      ['push', `${process.env.CI_REGISTRY_IMAGE}:${version}`],
      { stdio: 'inherit' }
    )
  }

  try {
    // parse version to parts
    const major = semver.major(version)
    const minor = semver.minor(version)
    const patch = semver.patch(version)
    const prerelease = semver.prerelease(version)
    const isProdRelease = prerelease.length === 0

    // first release version as it is
    await publish(version)

    if (isProdRelease) {
      // on production release X:latest, X:1.1, X:1
      await publish(`${major}.${minor}`)
      await publish(`${major}`)
      await publish('latest')
      return
    } else {
      const [channel] = prerelease

      // on other channels release X:channel, X:1.1.1-channel
      await publish(channel)
      await publish(`${major}.${minor}.${patch}-${channel}`)
    }
  } catch (err) {
    logger.error(err)
    logger.log('docker push failed')
    throw err
  }
}
