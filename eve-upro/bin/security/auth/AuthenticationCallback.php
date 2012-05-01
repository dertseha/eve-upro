<?php
namespace upro\security\auth
{

/**
 * The callback interface for the authentication method
 */
interface AuthenticationCallback
{
   /**
    * Called when a user has been authenticated.
    * The user tag should be a hash string that is based on the method used and
    * method+user specific data
    * @param string $userName The name of the authenticated user
    * @param string $userTag A secret that can be checked at the next authentication
    */
   function onUserAuthenticated($userName, $userTag);
}

}
