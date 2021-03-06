<?php
/**
 * Kapitchi Zend Framework 2 Modules
 *
 * @copyright Copyright (c) 2012-2014 Kapitchi Open Source Community (http://kapitchi.com/open-source)
 * @license   http://opensource.org/licenses/MIT MIT
 */ 

return [
    'authentication' => [
        'allow_registration' => true,
        'enable_on_registration' => true
    ],
    'zf-oauth2' => array(
        'allow_implicit' => true,
        'storage' => 'KapSecurity\\OAuth2\\PdoAdapter'
    ),
];