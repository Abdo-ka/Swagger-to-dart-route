# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Released]

## [0.0.1] - 2024-06-05
### Changed
- Updated the extension's image to improve visual appeal and clarity.
- Enhanced the README file with more detailed instructions and usage examples.
- Fixed typos and improved the wording in the README file for better readability.
- Updated the metadata in `package.json` to reflect the new changes.

## [0.0.2] - 2024-06-06
### Added
- Initial release of the extension.
- Core functionality including main feature set.
- Basic documentation in the README file.
- Initial extension icon and promotional images.

## [0.1.0] - 2024-06-06
### Added
- Added handling for parameterized endpoints in the Swagger file. The extension now correctly generates Dart routes with parameter names extracted from the URL paths. For example, `/user/{username}` will generate `static username(username) => '/user/$username';`.

### Fixed
- Fixed an issue where variable names derived from path segments incorrectly included braces, ensuring correct Dart route generation.
