<?php
/**
 * CSSMap module for Craft CMS 3.x
 *
 * Map css names to uglified names.
 *
 * @link      https://pennebaker.com
 * @copyright Copyright (c) 2018 Pennebaker
 */

namespace modules\cssmapmodule\twigextensions;

use modules\cssmapmodule\CSSMapModule;

use Craft;

/**
 * Twig can be extended in many ways; you can add extra tags, filters, tests, operators,
 * global variables, and functions. You can even extend the parser itself with
 * node visitors.
 *
 * http://twig.sensiolabs.org/doc/advanced.html
 *
 * @author    Pennebaker
 * @package   CSSMapModule
 * @since     1.0.0
 */
class CSSMapModuleTwigExtension extends \Twig_Extension
{
    // Public Methods
    // =========================================================================

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'CSSMapModule';
    }

    /**
     * Returns an array of Twig filters, used in Twig templates via:
     *
     *      {{ 'something' | mapId }}
     *      {{ 'element active'|mapClass }}
     *
     * @return array
     */
    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('mapClass', [$this, 'mapClass']),
            new \Twig_SimpleFilter('mapId', [$this, 'mapId']),
        ];
    }

    /**
     * Map names to new selectors
     *
     * @param string $selector
     * @param int $prefixLength
     *
     * @return string
     */
    private function map($selector, $prefixLength = 1)
    {
        $mappedNames = CSSMapModule::$cssMap;

        if (isset($mappedNames[$selector])) {
            return substr($mappedNames[$selector], $prefixLength);
        } else {
            return substr($selector, $prefixLength);
        }
    }

    /**
     * @param null $input
     *
     * @return string
     */
    public function mapClass($input = null)
    {
        $inputAry = explode(' ', $input);

        $outputAry = [];

        foreach($inputAry as $name) {
            array_push($outputAry, $this->map('.' . $name));
        }

        return implode(' ', $outputAry);
    }

    /**
     * @param null $input
     *
     * @return string
     */
    public function mapId($input = null)
    {
        return $this->map('#' . $input);
    }
}
