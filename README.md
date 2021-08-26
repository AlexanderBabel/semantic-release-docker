# @alexbabel/semantic-release-docker

## What is different in comparison to the upstream project?

This plugin also takes care of building the image. Therefore your ci file is much more simplified.

[![npm version](https://img.shields.io/npm/v/@alexbabel/semantic-release-docker.svg)](https://www.npmjs.com/package/@alexbabel/semantic-release-docker)
[![npm downloads](https://img.shields.io/npm/dm/@alexbabel/semantic-release-docker.svg)](https://www.npmjs.com/package/@alexbabel/semantic-release-docker)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Set of [semantic-release](https://github.com/semantic-release/semantic-release) plugins for publishing a docker image to [GitLab Container Registry](https://docs.gitlab.com/ce/user/project/container_registry.html).

```json
{
  "release": {
    "verifyConditions": "@alexbabel/semantic-release-docker",
    "prepare": {
      "path": "@alexbabel/semantic-release-docker",
      "buildArgs": [
        "--build-arg",
        "VARIABLE"
      ]
    },
    "publish": "@alexbabel/semantic-release-docker"
  }
}
```

## How to build for multiple platforms

```json
{
  "release": {
    "verifyConditions": "@alexbabel/semantic-release-docker",
    "prepare": {
      "path": "@alexbabel/semantic-release-docker",
      "buildArgs": [
        "--platform",
        "linux/amd64,linux/arm/v7,linux/arm64",
        "--push"
      ]
    },
    "publish": {
      "path": "@alexbabel/semantic-release-docker",
      "skipPublish": true
    }
  }
}
```

## Configuration

Environment variables:
| Variable               | Description                                           | Default                             |
| ---                    | ---                                                   | ---                                 |
| `CI_REGISTRY`          | The registry to push to                               | `ghcr.io`                           |
| `CI_REGISTRY_IMAGE`    | The name of the image including the registry domain   | `$CI_REGISTRY/$GITHUB_REPOSITORY`   |
| `CI_REGISTRY_USER`     | The user to use to authenticate against the registry  | `$GITHUB_ACTOR` (fallback: `AlexanderBabel`)                   |
| `CI_REGISTRY_PASSWORD` | The password for the specified user                   |                                     |

## **Plugins**

### `verifyConditions`

Verify that all needed configuration is present and login to the GitLab Container Registry.

### `prepare`

Build the docker image. You can pass additional build arguments if needed.

### `publish`

Tag the image with the new version, push it to GitLab Container Registry and update the `latest` tag.

**Multi Platform builds:** Can be skipped by using `"skipPublish": true` in the semantic release configuration. When using `buildx` you'll need to use the `--push` argument ([Reason](https://github.com/docker/buildx/issues/59)).

## Example .gitlab-ci.yml

```yml
stages:
  - test
  - release

test:
  image: node:alpine
  stage: test
  before_script:
    - npm i
  script:
    - npm t

release:
  image: node:alpine
  stage: release
  before_script:
    - npm i
  script:
    - npx semantic-release
  only:
    - master
```

## Example GitHub workflow file

```yml
name: Release a new version
on:
  push:
    branches:
      - main
      - development

jobs:
  release:
    if: |
      !(github.event_name == 'push' && contains(github.event.head_commit.message, '[skip ci]')) &&
      !(github.event_name == 'pull_request' && contains(join(github.event.pull_request.title, github.event.pull_request.body), '[skip ci]'))
    runs-on: ubuntu-latest
    steps:
      - name: Clone code repo
        uses: actions/checkout@v2

      # Required for multi platform builds
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v1

      # Required for multi platform builds
      - name: Set up Docker Buildx
        id: buildx
        uses: docker/setup-buildx-action@v1
        with:
          install: true

      # Useful if you want to use signed commits
      - name: Import GPG key
        uses: crazy-max/ghaction-import-gpg@v2
        with:
          git_user_signingkey: true
          git_commit_gpgsign: true
        env:
          GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
          PASSPHRASE: ${{ secrets.GPG_PASSPHRASE }}

      - name: Install dependencies
        run: yarn

      - name: Semantic release
        run: yarn semantic-release
        env:
          # This only works if you give access the project access to the package.
          # More information: https://docs.github.com/en/actions/guides/publishing-docker-images#publishing-images-to-github-packages
          CI_REGISTRY_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

          GIT_AUTHOR_NAME: ${{ secrets.GIT_USERNAME }}
          GIT_AUTHOR_EMAIL: ${{ secrets.GIT_EMAIL }}
          GIT_COMMITTER_NAME: ${{ secrets.GIT_USERNAME }}
          GIT_COMMITTER_EMAIL: ${{ secrets.GIT_EMAIL }}
```
