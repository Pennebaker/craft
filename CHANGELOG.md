# pennebaker/craft Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

##[1.0.15] - 2018.02.13
### Added
* Added `pen-scripts` folder database backup, restore and rsync scripts
* Added `craft-architect` to `composer.json`
* Added `LOCAL_BACKUPS_PATH` to  `pen-setup`
* Added  `outputString('npm i -g yarn gulp-cli', Console::FG_YELLOW);` to `pen-setup`

## [1.0.14] - 2018.01.29
### Added
* Added `post-install-cmd` to `composer.json` [(by nystudio107)](https://github.com/nystudio107/craft/releases/tag/1.0.11)

### Changed
* Switched from `craft.app.config.general.custom.baseUrl` to `alias('@baseUrl')` [(by nystudio107)](https://github.com/nystudio107/craft/releases/tag/1.0.12)
* Tell Composer to install PHP 7.1-compatible dependencies [(inspired by nystudio107)](https://github.com/nystudio107/craft/releases/tag/1.0.13)
* Fixed `sitemodule` namespacing [(by nystudio107)](https://github.com/nystudio107/craft/releases/tag/1.0.13)

## [1.0.13] - 2018.01.19
### Changed
* Synced the `modules/site` with `site-module` and pluginfactory.io generated modules. [(by nystudio107)](https://github.com/nystudio107/craft/releases/tag/1.0.10)
* Re-implement plugins in composer.json. (The cli install/plugins is for installing not fetching plugins)
* Only install select plugins by default in pen-setup.

## [1.0.12] - 2018.01.18
### Changed
* Moved all plugins from composer.json to pen-setup script.

## [1.0.10] - 2018.01.17
### Added
* Added Bourbon & Neat SCSS
* Added Bourbon & Neat SCSS
### Removed
* Removed Tailwind CSS
* Removed .htaccess for Apache
* Removed web.config for ASP.NET

Brought to you by [pennebaker](https://pennebaker.com/)

# nystudio107/craft Change Log

## [1.0.9] - 2018.01.06
### Added
* Added a static asset filename-based cache busting `LocalValetDriver.php` for Laravel Valet

## [1.0.8] - 2018.01.01
### Added
* Added a better PurgeCSS pipeline
* Added a `purgecssWhitelist` to `package.json`
* Execute JavaScript when doing Critical CSS
* Added a `criticalWhitelist` to `package.json`
* Added SiteModule framework to nystudio107/craft
* Added a `post-update-cmd` to `composer.json` to recreate any symlinks that may have been removed after a `composer update` or `composer install`

## [1.0.7] - 2017.12.16
### Added
* Added `purgecss` to production builds
* Added automatic incrementing of `staticAssetsVersion` for production builds

## [1.0.6] - 2017.12.16
### Changed
* Updated to use the latest `critical` package, adjusted `gulpfile.js` base path

## [1.0.5] - 2017.12.13
### Changed
* Slurp whitespace with the minify tags
* Fix favicon URLs/meta
* Fix manifest

## [1.0.4] - 2017.12.06
### Changed
* Fixed asset versioning in `sw.js`
* Run all inline JavaScript through `js-babel` for ES6 goodness

### Added
* Added base VueJS and Axios support

## [1.0.3] - 2017.12.05
### Changed
* Updated for Craft CMS 3 RC1 release

## [1.0.2] - 2017.12.04
### Changed
* Fixed deprecation errors
* Cleaned up the default ServiceWorker in `sw.js`
* Added Fontello CSS to the `package.json`
* Added PhpStorm Craft app API type hinting

## [1.0.1] - 2017.12.01
### Added
* Added accessible tabhandler.js
* Added Tailwind CSS
* Added support for Redis via `app.php`
* Fixed `package.json` paths for `web/`
* Cleaned up the default templates
* Added `src/conf/` for Nginx or other configuration files

## [1.0.0] - 2017.11.26
### Added
* Initial release

Brought to you by [nystudio107](https://nystudio107.com/)

[Unreleased]: https://github.com/pennebaker/craft/compare/1.0.15...HEAD
[1.0.15]: https://github.com/pennebaker/craft/compare/1.0.14...1.0.15
[1.0.14]: https://github.com/pennebaker/craft/compare/1.0.13...1.0.14
[1.0.13]: https://github.com/pennebaker/craft/compare/1.0.12...1.0.13
[1.0.12]: https://github.com/pennebaker/craft/compare/1.0.10...1.0.12
[1.0.10]: https://github.com/pennebaker/craft/compare/1.0.9...1.0.10
[1.0.9]: https://github.com/pennebaker/craft/compare/1.0.8...1.0.8
[1.0.8]: https://github.com/pennebaker/craft/compare/1.0.7...1.0.8
[1.0.7]: https://github.com/pennebaker/craft/compare/1.0.6...1.0.7
[1.0.6]: https://github.com/pennebaker/craft/compare/1.0.5...1.0.6
[1.0.5]: https://github.com/pennebaker/craft/compare/1.0.4...1.0.5
[1.0.4]: https://github.com/pennebaker/craft/compare/1.0.3...1.0.4
[1.0.3]: https://github.com/pennebaker/craft/compare/1.0.2...1.0.3
[1.0.2]: https://github.com/pennebaker/craft/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/pennebaker/craft/compare/1.0.0...1.0.1
[1.0.1]: https://github.com/pennebaker/craft/compare/1.0.0...1.0.1
