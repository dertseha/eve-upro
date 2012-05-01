<?php
namespace upro\security\auth
{
require_once realpath(dirname(__FILE__)) . '/../../io/ValueProvider.php';
require_once realpath(dirname(__FILE__)) . '/AuthenticationCallback.php';
require_once realpath(dirname(__FILE__)) . '/AuthenticationMethod.php';

/**
 * An dummy authentication method. Only meant for testing and demonstration purposes.
 * There is no check involved, the entered user name and tag is directly used
 */
class DummyAuthenticationMethod implements \upro\security\auth\AuthenticationMethod
{
   /**
    * Name of the reported method
    * @var string
    */
   const METHOD_NAME = 'dummy';

   /**
    * Parameter name for start
    * @var string
    */
   const PARAMETER_KEY_USER_NAME = 'userName';

   /**
    * Parameter name for start
    * @var string
    */
   const PARAMETER_KEY_SECRET = 'secret';

   /**
    * Constructor
    */
   function __construct()
   {

   }

   /** {@inheritDoc} */
   public function getName()
   {
      return \upro\security\auth\DummyAuthenticationMethod::METHOD_NAME;
   }

   /** {@inheritDoc} */
   public function getTitle()
   {
      return 'Dummy (for testing only)';
   }

   /** {@inheritDoc} */
   public function getHtmlFormBody()
   {
      $formBody = '';

      $formBody .= "\n" . '<label for="userName">User Name</label>';
      $formBody .= "\n" . '<input type="text" name="userName" required="true" placeholder="User Name" />';
      $formBody .= "\n" . '<label for="secret">Secret</label>';
      $formBody .= "\n" . '<input type="text" name="secret" required="true" placeholder="Secret" />';

      $formBody .= "\n" . '<input type="submit" name="submit" value="Log In" />';

      return $formBody;
   }

   /** {@inheritDoc} */
   public function start(\upro\security\auth\AuthenticationCallback $callback,
         \upro\io\ValueProvider $parameters)
   {
      $userName = $parameters->get(\upro\security\auth\DummyAuthenticationMethod::PARAMETER_KEY_USER_NAME);
      $secret = $parameters->get(\upro\security\auth\DummyAuthenticationMethod::PARAMETER_KEY_SECRET);

      $callback->onUserAuthenticated($userName, $this->getUserTag($secret));

      return true;
   }

   /** {@inheritDoc} */
   public function update(\upro\security\auth\AuthenticationCallback $callback)
   {
      return false;
   }

   /**
    * Creates a hash from the login information
    * @param string $secret The secret to include in the hash
    * @return string a hash
    */
   private function getUserTag($secret)
   {
      $rawText = \upro\security\auth\DummyAuthenticationMethod::METHOD_NAME . '|';
      $rawText .= $secret . '|';

      return md5($rawText);
   }
}

}