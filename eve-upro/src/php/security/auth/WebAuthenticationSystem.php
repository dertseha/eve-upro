<?php
namespace upro\security\auth
{
require_once realpath(dirname(__FILE__)) . '/AuthenticationCallback.php';
require_once realpath(dirname(__FILE__)) . '/AuthenticationMethod.php';
require_once realpath(dirname(__FILE__)) . '/../../web/WebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/../../web/StreamHtmlPageBuilder.php';
require_once realpath(dirname(__FILE__)) . '/../../web/InlineScriptResource.php';

/**
 * This system handles authentication requests for pages that need login control.
 * The actual login verification is handled by the user of this class - this one
 * only handles authentication to provide a final user name and hash tag, the
 * user of this class needs to verify further.
 */
class WebAuthenticationSystem
{
   /**
    * The context the system runs in
    * @var \upro\web\WebAppContext
    */
   private $context;

   /**
    * User callback
    * @var \upro\security\auth\AuthenticationCallback
    */
   private $callback;

   /**
    * An array of supported authentication methods
    * @var array
    */
   private $authenticationMethods = array();

   /**
    * Constructor
    * @param \upro\web\WebAppContext $context The context this system runs in
    * @param \upro\security\auth\AuthenticationCallback $callback the callback to use for success
    */
   function __construct(\upro\web\WebAppContext $context, \upro\security\auth\AuthenticationCallback $callback)
   {
      $this->context = $context;
      $this->callback = $callback;
   }

   /**
    * Adds given authentication method to the list of supported methods. The login page will
    * show each method available.
    * @param \upro\security\auth\AuthenticationMethod $method the method to add
    */
   public function addMethod(\upro\security\auth\AuthenticationMethod $method)
   {
      $this->authenticationMethods[] = $method;
   }

   /**
    * Handles the current request. If no authentication is in progress or started, a login page
    * will be presented. When a login request has been successfully processed, the callback
    * listener will be informed.
    */
   public function handleRequest()
   {
      if (!$this->updateAuthenticationInProgress())
      {
         if (!$this->isRequestToLogIn() || !$this->startAuthentication())
         {
            $this->showLoginPage();
         }
      }
   }

   /**
    * @return boolean true if the current request is one to log in
    */
   private function isRequestToLogIn()
   {
      $data = $this->context->getRequestData();

      return $data->get('action') === 'login';
   }

   /**
    * Updates any authentication method in progress
    * @return boolean true if an authentication is in progress
    */
   private function updateAuthenticationInProgress()
   {
      $authMethods = count($this->authenticationMethods);
      $result = false;

      for ($i = 0; !$result && ($i < $authMethods); $i++)
      {
         $method = $this->authenticationMethods[$i];

         $result = $method->update($this->callback);
      }

      return $result;
   }

   /**
    * Tries to start the authentication from the current request data
    * @return boolean true if authentication was successfully started
    */
   private function startAuthentication()
   {
      $parameters = $this->context->getRequestData();
      $method = $this->findAuthenticationMethod($parameters->get('method'));
      $result = false;

      if (!is_null($method))
      {
         $result = $method->start($this->callback, $parameters);
      }

      return $result;
   }

   /**
   * Finds a registered authentication method for given name
   * @param string $name the name to look for
   * @return \upro\security\auth\AuthenticationMethod the found method or null
   */
   private function findAuthenticationMethod($name)
   {
      $foundMethod = null;
      $authMethods = count($this->authenticationMethods);

      for ($i = 0; is_null($foundMethod) && ($i < $authMethods); $i++)
      {
         $method = $this->authenticationMethods[$i];

         if ($method->getName() === $name)
         {
            $foundMethod = $method;
         }
      }

      return $foundMethod;
   }

   /**
    * Shows the login page
    */
   private function showLoginPage()
   {
      $pageBuilder = new \upro\web\StreamHtmlPageBuilder($this->context->getOut());

      $pageBuilder->start();
      $pageBuilder->setTitle("upro - Authentication System - Login Page");
      \upro\web\InlineScriptResource::getForCascadingStyleSheet(
            $this->context->getFileResource('res/login.css')->getContent())->addToPage($pageBuilder);
      $pageBuilder->enterBody();

      foreach ($this->authenticationMethods as $method)
      {
         $form = '<h2>' . $method->getTitle() . '</h2>';
         $form .= "\n" . '<form action="" method="post">';
         $form .= "\n" . '<input type="hidden" name="action" value="login" />';
         $form .= "\n" . '<input type="hidden" name="method" value="' . $method->getName() . '" />';
         $form .= $method->getHtmlFormBody();
         $form .= "\n" . '</form>';

         $pageBuilder->addNode('section', array(), $form);
      }

      $pageBuilder->finish();
   }
}

}
