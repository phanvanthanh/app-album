<?php

namespace KapSecurity\Authentication;

use Zend\Stdlib\ArrayObject;

/**
 * A class representing an user profile fetch from various authentication providers
 * 
 * @package KapSecurity\Authentication
 * 
 * @property mixed $id Unique provider identifier of an user
 * @property strint $username
 * @property string $displayName
 * @property string $firstName
 * @property string $lastName
 * @property string $email
 * @property string $imageUrl
 * 
 */
class UserProfile extends ArrayObject {
    
} 