<?php
/**
 * Craft 3 Multi-Environment
 * Efficient and flexible multi-environment config for Craft 3 CMS
 *
 * $_ENV constants are loaded by craft3-multi-environment from .env.php via
 * ./web/index.php for web requests, and ./craft for console requests
 *
 * @author    nystudio107
 * @copyright Copyright (c) 2017 nystudio107
 * @link      https://nystudio107.com/
 * @package   craft3-multi-environment
 * @since     1.0.5
 * @license   MIT
 */

/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here.
 * You can see a list of the default settings in src/config/GeneralConfig.php
 */

return [

    // All environments
    '*' => [
    ],

    // Live (production) environment
    'live' => [
    ],

    // Staging (pre-production) environment
    'staging' => [
    ],

    // Local (development) environment
    'local' => [
        // Preset image processors
        'imageProcessors'            => [
            // jpeg optimizers
            'jpegoptim' => [
                'commandPath'           => '/usr/local/bin/jpegoptim', // OSX brew path
                'commandOptions'        => '-s',
                'commandOutputFileFlag' => '',
            ],
            'jpegtran'  => [
                'commandPath'           => '/usr/local/bin/jpegtran', // OSX brew path
                'commandOptions'        => '-optimize -copy none',
                'commandOutputFileFlag' => '',
            ],
            // png optimizers
            'optipng'   => [
                'commandPath'           => '/usr/local/bin/optipng', // OSX brew path
                'commandOptions'        => '-o3 -strip all',
                'commandOutputFileFlag' => '',
            ],
            'pngcrush'  => [
                'commandPath'           => '/usr/local/bin/pngcrush', // OSX brew path
                'commandOptions'        => '-brute -ow',
                'commandOutputFileFlag' => '',
            ],
            'pngquant'  => [
                'commandPath'           => '/usr/local/bin/pngquant', // OSX brew path
                'commandOptions'        => '--strip--skip -if-larger',
                'commandOutputFileFlag' => '',
            ],
            // svg optimizers
            'svgo'      => [
                'commandPath'           => '/usr/local/bin/svgo', // OSX brew path
                'commandOptions'        => '',
                'commandOutputFileFlag' => '',
            ],
            // gif optimizers
            'gifsicle'  => [
                'commandPath'           => '/usr/local/bin/gifsicle', // OSX brew path
                'commandOptions'        => '-O3 -k 256',
                'commandOutputFileFlag' => '',
            ],
        ],

        'imageVariantCreators' => [
            // webp variant creator
            'cwebp' => [
                'commandPath'           => '/usr/local/bin/cwebp',
                'commandOptions'        => '',
                'commandOutputFileFlag' => '-o',
                'commandQualityFlag'    => '-q',
                'imageVariantExtension' => 'webp',
            ],
        ],
    ],
];
