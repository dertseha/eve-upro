<?php
require_once realpath(dirname(__FILE__)) . '/../../../src/php/web/WebApplication.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/web/WebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/web/StreamHtmlPageBuilder.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/web/SessionControl.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/security/auth/WebAuthenticationSystem.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/io/ValueStore.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/security/auth/AuthenticationCallback.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/security/auth/OpenIdAuthenticationMethod.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/security/auth/DummyAuthenticationMethod.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/web/InlineScriptResource.php';

/**
 * The application
 */
class AuthenticationSystemApplication implements \upro\web\WebApplication, \upro\security\auth\AuthenticationCallback
{
   const SUBSET_NAME_APP_DATA = 'appData_';

   const APP_DATA_USER_NAME = 'userName';

   private $context;

   /**
    * Value store for app data
    * @var \upro\io\ValueStore
    */
   private $appDataStore;

   function __construct(\upro\web\WebAppContext $context)
   {
      $session = $context->getSessionControl();

      $this->context = $context;
      $this->appDataStore = $session->getValueStore()->subset(AuthenticationSystemApplication::SUBSET_NAME_APP_DATA);
   }

   /** {@inheritDoc} */
   public function run()
   {
      if ($this->isRequestToLogOut())
      {
         $this->logOut();
      }
      if ($this->isUserLoggedIn())
      {
         $this->showSecretPage();
      }
      else
      {
         $this->handleAuthentication();
      }
   }

   private function handleAuthentication()
   {
      $system = new \upro\security\auth\WebAuthenticationSystem($this->context, $this);

      $system->addMethod(
            new \upro\security\auth\OpenIdAuthenticationMethod('localhost', $this->context));
      $system->addMethod(
            new \upro\security\auth\DummyAuthenticationMethod());

      $system->handleRequest();
   }

   private function isUserLoggedIn()
   {
      return $this->appDataStore->has(AuthenticationSystemApplication::APP_DATA_USER_NAME);
   }

   private function isRequestToLogOut()
   {
      $data = $this->context->getRequestData();

      return $data->get('action') === 'logout';
   }

   private function logOut()
   {
      $this->appDataStore->del(AuthenticationSystemApplication::APP_DATA_USER_NAME);
   }

   /** {@inheritDoc} */
   public function onUserAuthenticated($userName, $userTag)
   {
      $this->appDataStore->set(AuthenticationSystemApplication::APP_DATA_USER_NAME, $userName);
      $this->context->setRedirection($_SERVER['PHP_SELF']);
   }

   private function showSecretPage()
   {
      $pageBuilder = new \upro\web\StreamHtmlPageBuilder($this->context->getOut());

      $pageBuilder->start();
      $pageBuilder->setTitle("upro - AuthenticationSystem Test - Secret Page");
      $pageBuilder->enterBody();

      $pageBuilder->addNode('div', array(), "It's a secret! For: " .
            $this->appDataStore->get(AuthenticationSystemApplication::APP_DATA_USER_NAME));

      $formBody = 'Log Out:'
            . ' <input type="hidden" name="action" value="logout" />'
            . ' <input type="submit" name="request" value="Log Out" />';
      $pageBuilder->addNode('form', array('action' => '', 'method' => 'post'), $formBody);

      $pageBuilder->finish();
   }
}
