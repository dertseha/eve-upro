<?php
namespace upro\security\auth
{
require_once realpath(dirname(__FILE__)) . '/../../util/logging/LoggerProvider.php';
require_once realpath(dirname(__FILE__)) . '/../../io/ValueStore.php';
require_once realpath(dirname(__FILE__)) . '/../../io/SimpleValueStore.php';
require_once realpath(dirname(__FILE__)) . '/../../io/MergingValueProvider.php';
require_once realpath(dirname(__FILE__)) . '/../../web/WebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/AuthenticationCallback.php';
require_once realpath(dirname(__FILE__)) . '/AuthenticationMethod.php';

if (file_exists(dirname(dirname(dirname(__FILE__))) . '/lib/php/lightopenid/openid.php'))
{   // production case
   require_once dirname(dirname(dirname(__FILE__))) . '/lib/php/lightopenid/openid.php';
}
else
{   // test case
   require_once dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/lib/php/lightopenid/openid.php';
}

/**
 * An authentication method using OpenID
 */
class OpenIdAuthenticationMethod implements \upro\security\auth\AuthenticationMethod
{
   /**
    * Standard identity URL for Google
    * @var string
    */
   const IDENTITY_URL_GOOGLE = 'https://www.google.com/accounts/o8/id';

   /**
    * Name of the reported method
    * @var string
    */
   const METHOD_NAME = 'openId';

   /**
    * Parameter name for start
    * @var string
    */
   const PARAMETER_KEY_OPEN_ID_URL = 'openIdUrl';

   /**
    * Parameter name for start
    * @var string
    */
   const PARAMETER_KEY_USER_NAME = 'userName';

   /**
    * Name under which to store session data
    * @var string
    */
   const SESSION_SUBSET_NAME = 'openId_';

   /**
    * Session data key for the user name
    * @var string
    */
   const SESSION_KEY_USER_NAME = 'userName';

   /**
    * OpenID attribute for email address
    * @var string
    */
   const ATTRIBUTE_NAME_CONTACT_EMAIL = 'contact/email';

   /**
    * The realm for the authentication request; The one the provider will add to the list of trusted.
    * @var string
    */
   private $realm;

   /**
    * The context this authentication runs in
    * @var \upro\web\WebAppContext
    */
   private $context;

   /**
    * The provided session store
    * @var \upro\io\ValueStore
    */
   private $sessionStore;

   /**
    * Constructor
    * @param string $realm the URL to use as 'trusted root' at the OpenID provider
    * @param \upro\web\WebAppContext $context the context this method runs in
    */
   function __construct($realm, \upro\web\WebAppContext $context)
   {
      $this->realm = $realm;
      $this->context = $context;
      $this->sessionStore = $context->getSessionControl()->getValueStore()
            ->subset(\upro\security\auth\OpenIdAuthenticationMethod::SESSION_SUBSET_NAME);
   }

   /**
    * @return \upro\util\logging\Logger the logger for this class
    */
   private function getLogger()
   {
      return \upro\util\logging\LoggerProvider::getLogger(get_class());
   }

   /** {@inheritDoc} */
   public function getName()
   {
      return \upro\security\auth\OpenIdAuthenticationMethod::METHOD_NAME;
   }

   /** {@inheritDoc} */
   public function getTitle()
   {
      return 'OpenID';
   }

   /** {@inheritDoc} */
   public function getHtmlFormBody()
   {
      $formBody = '';

      $formBody .= "\n" . '<label for="userName">User Name</label>';
      $formBody .= "\n" . '<input type="text" name="userName" required="true" placeholder="User Name" />';
      $formBody .= "\n" . '<label for="openIdUrl">URL</label>';
      $formBody .= "\n" . '<input type="url" name="openIdUrl" placeholder="URL" />';

      $formBody .= "\n" . '<input type="submit" name="submitOpenId" value="Log In" />';
      $formBody .= "\n" . '<input type="submit" name="submitGoogle" value="Google" />';

      return $formBody;
   }

   /** {@inheritDoc} */
   public function start(\upro\security\auth\AuthenticationCallback $callback,
         \upro\io\ValueProvider $parameters)
   {
      $fixedParameters = $this->fixStartParameters($parameters);
      $openId = new \LightOpenID($this->realm);

      $openId->identity = $fixedParameters->get(\upro\security\auth\OpenIdAuthenticationMethod::PARAMETER_KEY_OPEN_ID_URL);
      $openId->required = array(\upro\security\auth\OpenIdAuthenticationMethod::ATTRIBUTE_NAME_CONTACT_EMAIL);

      $this->sessionStore->set(\upro\security\auth\OpenIdAuthenticationMethod::SESSION_KEY_USER_NAME,
            $fixedParameters->get(\upro\security\auth\OpenIdAuthenticationMethod::PARAMETER_KEY_USER_NAME));
      $this->context->setRedirection($openId->authUrl());

      return true;
   }

   /** {@inheritDoc} */
   public function update(\upro\security\auth\AuthenticationCallback $callback)
   {
      $openId = new \LightOpenID($this->realm);
      $result = false;

      if ($openId->mode == 'cancel')
      {
         // aborted
         $this->sessionStore->del(\upro\security\auth\OpenIdAuthenticationMethod::SESSION_KEY_USER_NAME);
      }
      else if ($openId->mode)
      {
         $userName = $this->sessionStore->get(\upro\security\auth\OpenIdAuthenticationMethod::SESSION_KEY_USER_NAME);

         $this->sessionStore->del(\upro\security\auth\OpenIdAuthenticationMethod::SESSION_KEY_USER_NAME);
         if ($openId->validate())
         {
            $callback->onUserAuthenticated($userName, $this->getUserTag($openId));
            $result = true;
         }
         else
         {
            $this->getLogger()->info('Login failed for user [%s]', $userName);
         }
      }

      return $result;
   }

   /**
    * Fixes the start parameters - sets defaults for specific
    * @param \upro\io\ValueProvider $parameters the original start parameters
    * @return \upro\io\ValueProvider a provider containing the fixed paramters
    */
   private function fixStartParameters(\upro\io\ValueProvider $parameters)
   {
      $autoParameters = new \upro\io\SimpleValueStore();
      $fixedParameters = new \upro\io\MergingValueProvider();

      $fixedParameters->addProvider($autoParameters);
      $fixedParameters->addProvider($parameters);

      if ($parameters->has('submitGoogle'))
      {   // OpenID case for google
         $autoParameters->set(\upro\security\auth\OpenIdAuthenticationMethod::PARAMETER_KEY_OPEN_ID_URL,
               \upro\security\auth\OpenIdAuthenticationMethod::IDENTITY_URL_GOOGLE);
      }

      return $fixedParameters;
   }

   /**
    * Creates a hash from the users information
    * @param \LightOpenID $openId to extract unique properties
    * @return string a hash
    */
   private function getUserTag(\LightOpenID $openId)
   {
      $attributes = $openId->getAttributes();
      $rawText = '';

      $rawText .= $attributes[\upro\security\auth\OpenIdAuthenticationMethod::ATTRIBUTE_NAME_CONTACT_EMAIL] . '|';

      return \upro\security\auth\OpenIdAuthenticationMethod::METHOD_NAME . '|' . md5($rawText);
   }
}

}