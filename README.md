# @alexbabel/semantic-release-docker

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

## Plugins

### `verifyConditions`

Verify that all needed configuration is present and login to the GitLab Container Registry.

### `prepare`

Build the docker image. You can pass additional build arguments if needed.

### `publish`

Tag the image with the new version, push it to GitLab Container Registry and update the `latest` tag.

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
    - docker build -t $CI_REGISTRY_IMAGE .
  script:
    - npx semantic-release
  only:
    - master
```
