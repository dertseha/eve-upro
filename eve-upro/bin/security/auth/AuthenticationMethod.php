<?php
namespace upro\security\auth
{
require_once realpath(dirname(__FILE__)) . '/AuthenticationCallback.php';
require_once realpath(dirname(__FILE__)) . '/../../io/ValueProvider.php';

/**
 * A method for authentication.
 */
interface AuthenticationMethod
{
   /**
    * @return string unique name of this method
    */
   function getName();

   /**
    * @return string Human identifiable title of this method
    */
   function getTitle();

   /**
    * Returns an HTML form body that covers all necessary parameters for start
    * @return string an HTML form body markup
    */
   function getHtmlFormBody();

   /**
    * Requests to start an authentication process.
    * If this method returns true, the caller should not do anything further - the method is
    * handling the states
    * If false is returned, some error happened.
    * @param \upro\security\auth\AuthenticationCallback $callback the callback to inform of progress
    * @param \upro\io\ValueProvider $parameters generic parameters provided to the method
    * @return boolean false if the method was not initialized or no login active
    */
   function start(\upro\security\auth\AuthenticationCallback $callback,
         \upro\io\ValueProvider $parameters);

   /**
    * Requests to update a currently running authentication process.
    * If this method returns true, the caller should not do anything further - the method is
    * handling the states
    * If false is returned, no login was active or pending and the caller should revert to the
    * login form.
    * @param \upro\security\auth\AuthenticationCallback $callback the callback to inform of progress
    * @return boolean false if the method was not initialized or no login active
    */
   function update(\upro\security\auth\AuthenticationCallback $callback);
}

}
