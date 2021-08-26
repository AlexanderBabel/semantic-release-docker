const execa = require('execa')
const semver = require('semver')
const getImage = require('./get-image')

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
module.exports = async (pluginConfig, { nextRelease: { version } }) => {
  const { buildArgs } = pluginConfig
  const image = getImage(pluginConfig)

  try {
    // parse version to parts
    const major = semver.major(version)
    const minor = semver.minor(version)
    const patch = semver.patch(version)
    const prerelease = semver.prerelease(version)
    const isProdRelease = !prerelease || prerelease.length === 0

    const tags = [];

    if (isProdRelease) {
      // on production release X:latest, X:1.1, X:1
      tags.push(version)
      tags.push(`${major}.${minor}`)
      tags.push(`${major}`)
      tags.push('latest')
    } else {
      const [channel] = prerelease

      // on other channels release X:channel, X:1.1.1-channel
      tags.push(channel)
      tags.push(`${major}.${minor}.${patch}-${channel}`)
      tags.push(version)
    }

    await execa(
      'docker',
      [
        'build',

        // insert tags
        ...tags.reduce((array, tag) => { 
          array.push('-t', tag);
          return array;
        }, []),

        // insert extra args
        ...(buildArgs || []),

        '.'
      ],
      { stdio: 'inherit' }
    )
  } catch (err) {
    throw new Error('docker build failed')
  }
}
