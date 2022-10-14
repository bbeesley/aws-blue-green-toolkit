## [3.4.1](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v3.4.0...v3.4.1) (2022-10-14)


### Bug Fixes

* ensure legacy cjs output can be loaded ([5bbf9e6](https://github.com/bbeesley/aws-blue-green-toolkit/commit/5bbf9e641a10f7610cd3004ce462155b4ac23d05))

# [3.4.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v3.3.0...v3.4.0) (2022-09-29)


### Features

* add a retry with delay when db not ready ([26b71a7](https://github.com/bbeesley/aws-blue-green-toolkit/commit/26b71a7f90b4dd67749c0adc24342ab5aaade20d))

# [3.3.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v3.2.0...v3.3.0) (2022-09-02)


### Features

* allow re enabling insights if disabled ([72458a4](https://github.com/bbeesley/aws-blue-green-toolkit/commit/72458a411e0c376550d2f297da44f30d130b4e88))

# [3.2.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v3.1.0...v3.2.0) (2022-09-02)


### Features

* add back legacy support for cjs ([68f7603](https://github.com/bbeesley/aws-blue-green-toolkit/commit/68f76039aabfed1869f95f37e874e5b536b10869))

# [3.1.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v3.0.1...v3.1.0) (2022-08-26)


### Features

* adds enablePerformanceInsights method to AuroraTools ([4bf202e](https://github.com/bbeesley/aws-blue-green-toolkit/commit/4bf202e7d0ab69272e94719bf8a98029b57c725d))

## [3.0.1](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v3.0.0...v3.0.1) (2022-08-12)


### Bug Fixes

* only require namespace for aurora utils ([c1533b9](https://github.com/bbeesley/aws-blue-green-toolkit/commit/c1533b95ad7f7788a7630ff0002fc28351b63807))

# [3.0.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v2.1.1...v3.0.0) (2022-08-12)


### Bug Fixes

* update exports ([42d95dd](https://github.com/bbeesley/aws-blue-green-toolkit/commit/42d95dd7a33a43a8d8865b7e3d219b8714d3b151))


### Features

* migrate to aws sdk v3 and es modules ([dbd051a](https://github.com/bbeesley/aws-blue-green-toolkit/commit/dbd051ad67db544aadf1a642b0755cdceff988fa))


### BREAKING CHANGES

* Common JS is no longer supported

## [2.1.1](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v2.1.0...v2.1.1) (2021-07-08)


### Bug Fixes

* **build:** build es modules that support node 12 ([27251cf](https://github.com/bbeesley/aws-blue-green-toolkit/commit/27251cf00642449ae236d7b50de52ed4006bd31b))

# [2.1.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v2.0.1...v2.1.0) (2021-07-02)


### Features

* migrate to ES module exports ([15f68a4](https://github.com/bbeesley/aws-blue-green-toolkit/commit/15f68a42cbaee116a880269871f5acdf828fcac9))

## [2.0.1](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v2.0.0...v2.0.1) (2021-06-14)

# [2.0.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.12.0...v2.0.0) (2021-06-03)


### Features

* **lambda-tools:** add a helper method to retrieve the latest lambda metrics ([2625bb8](https://github.com/bbeesley/aws-blue-green-toolkit/commit/2625bb8019f3c1ec6edb4404784091e862d486c7))
* drop support for node 10 ([988d4e2](https://github.com/bbeesley/aws-blue-green-toolkit/commit/988d4e2e962d11651fe5e50e4cb8287ddcfe00ea))


### BREAKING CHANGES

* node10 is no longer supported. Minimum supported version is now node 12.

# [1.12.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.11.0...v1.12.0) (2021-01-05)


### Features

* **kinesis-tools:** add describe consumer method to check consumer status ([6e724b9](https://github.com/bbeesley/aws-blue-green-toolkit/commit/6e724b946a7a6e90221a1d6da51f28015076e5ca))

# [1.11.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.10.0...v1.11.0) (2020-12-09)


### Features

* add kinesis toolset to support consumer stream management ([d00ab1c](https://github.com/bbeesley/aws-blue-green-toolkit/commit/d00ab1c0d0d0adb5ed9b0d6b06e76be868ea761b))
* **lambda-tools:** add event source mapping helpers ([2a698b1](https://github.com/bbeesley/aws-blue-green-toolkit/commit/2a698b1a4cf265a4aedd66a868f92fd8b792fb55))

# [1.10.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.9.0...v1.10.0) (2020-11-27)


### Features

* **dynamo-tools:** optionally wait for dynamo table deletions to complete ([27a96b7](https://github.com/bbeesley/aws-blue-green-toolkit/commit/27a96b704d53fd2b1a9950bb762df9a46f01b4f8))

# [1.9.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.8.2...v1.9.0) (2020-10-20)


### Features

* add dynamo tools ([afeab90](https://github.com/bbeesley/aws-blue-green-toolkit/commit/afeab90b53afe1254b70edc1e1e04697e7f7ac7b))

## [1.8.2](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.8.1...v1.8.2) (2020-07-09)


### Bug Fixes

* **deps:** bump to patch security vulnerability in deps ([10783ca](https://github.com/bbeesley/aws-blue-green-toolkit/commit/10783cac7d4f750016a0e2c1ebb1b0a6a3870ded))

## [1.8.1](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.8.0...v1.8.1) (2020-02-07)


### Bug Fixes

* **lambda-tools:** modify rules by arn not function name ([26dfcab](https://github.com/bbeesley/aws-blue-green-toolkit/commit/26dfcab37843f44d2b0eb6483c0d24023052f4bb))

# [1.8.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.7.0...v1.8.0) (2020-02-05)


### Features

* **lambda-tools:** add support for lambda aliases ([1269808](https://github.com/bbeesley/aws-blue-green-toolkit/commit/1269808d1e76f9c9796b20052536dc8c86476dfe))

# [1.7.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.6.0...v1.7.0) (2020-02-03)


### Features

* **lambda-tools:** adds methods for lambda versions and aliases ([710dc4b](https://github.com/bbeesley/aws-blue-green-toolkit/commit/710dc4b10f9e7fb4eee19bc9fb6247c189b07687))

# [1.6.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.5.1...v1.6.0) (2020-01-28)


### Features

* **cloudwatch:** add cloudwatch alarm tools ([6ce3848](https://github.com/bbeesley/aws-blue-green-toolkit/commit/6ce3848af06ae3dbca2cf7fc9492c2f4d64724d2))

## [1.5.1](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.5.0...v1.5.1) (2019-12-30)


### Bug Fixes

* **lambda-tools:** avoid losing aws events `this` context ([9df6a1d](https://github.com/bbeesley/aws-blue-green-toolkit/commit/9df6a1d56838fb1e60705dff677ac77d53e235b6))

# [1.5.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.4.1...v1.5.0) (2019-12-30)


### Features

* **lambda-tools:** make aws calls in sequence ([ea7537a](https://github.com/bbeesley/aws-blue-green-toolkit/commit/ea7537a7b22be6642d47c749fed7be298552c67b))

## [1.4.1](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.4.0...v1.4.1) (2019-12-25)

# [1.4.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.3.0...v1.4.0) (2019-12-25)


### Features

* **lambda-tools:** add tools for enabling and disabling lambda triggers ([184ee36](https://github.com/bbeesley/aws-blue-green-toolkit/commit/184ee367b70bb75bf1a7892f6db135a61a713f26))

# [1.3.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.2.0...v1.3.0) (2019-12-25)


### Features

* **sqs-tools:** add tools for purging SQS queues and DLQs ([854b825](https://github.com/bbeesley/aws-blue-green-toolkit/commit/854b825d2c909fbb6dadb8a58cc97c41270a3453))

# [1.2.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.1.0...v1.2.0) (2019-12-25)


### Features

* **sns-tools:** add tools to enable and disable sns subscriptions ([99febbf](https://github.com/bbeesley/aws-blue-green-toolkit/commit/99febbf529845c364a24a3d21c1bae215555d0bb))
* **sns-tools:** make sns tools public ([1fcd622](https://github.com/bbeesley/aws-blue-green-toolkit/commit/1fcd622e1cd4125ade086529fe71882d1ef33b92))

# [1.1.0](https://github.com/bbeesley/aws-blue-green-toolkit/compare/v1.0.0...v1.1.0) (2019-12-25)


### Features

* **aurora-tools:** add initial version of aurora tools ([1c9af52](https://github.com/bbeesley/aws-blue-green-toolkit/commit/1c9af5282fa35036f12dc4020fda4b3b3675ab97))
