<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../io/ValueStore.php';
require_once realpath(dirname(__FILE__)) . '/RequestServerContext.php';

/**
 * Implementing a check to prevent session hijacks.
 * During validation, the session for a new client receives a watermark, and a new ID value assigned.
 * If the session a returning client does not match the watermark, it is considered invalid.
 *
 * The watermark is calculated based on the remote IP and the user agent identification.
 *
 * Extra Information:
 * http://stackoverflow.com/questions/5081025/php-session-fixation-hijacking
 */
class SessionHijackPreventer
{
   /**
    * subset identification
    * @var string
    */
   const STORE_SUBSET_NAME = 'sessionWatermark_';

   /**
    * The key for the hashValue
    * @var string
    */
   const STORE_CLIENT_HASH_KEY = 'clientHash';

   /**
    * The key for the id
    * @var string
    */
   const STORE_ID_KEY = 'clientId';

   /**
    * The value store accessing session variables
    * @var \upro\io\ValueStore
    */
   private $sessionStore;

   /**
    * The server context to check
    * @var \upro\web\RequestServerContext
    */
   private $requestServerContext;

   /**
    * Constructor
    * @param \upro\io\ValueStore $sessionStore the session store to verify values in
    * @param \upro\web\RequestServerContext $requestServerContext the server context to check against
    */
   function __construct(\upro\io\ValueStore $sessionStore, \upro\web\RequestServerContext $requestServerContext)
   {
      $this->sessionStore = $sessionStore->subset(\upro\web\SessionHijackPreventer::STORE_SUBSET_NAME);
      $this->requestServerContext = $requestServerContext;
   }

   /**
    * Validates the session against the server context.
    * If the session is unknown so far, it will be initialized and considered valid.
    * If it has been initialized, it is checked whether the session is coming from the expected client
    * @return boolean true if the session is valid
    */
   public function validate()
   {
      $expectedHash = $this->getRemoteHash();
      $result = false;

      if (!$this->sessionStore->has(\upro\web\SessionHijackPreventer::STORE_CLIENT_HASH_KEY))
      {
         $this->sessionStore->set(\upro\web\SessionHijackPreventer::STORE_CLIENT_HASH_KEY, $expectedHash);
         $this->sessionStore->set(\upro\web\SessionHijackPreventer::STORE_ID_KEY, \Uuid::v4());
         $result = true;
      }
      else
      {
         $reportedHash = $this->sessionStore->get(\upro\web\SessionHijackPreventer::STORE_CLIENT_HASH_KEY);

         if (strcmp($reportedHash, $expectedHash) == 0)
         {
            $result = true;
         }
      }

      return $result;
   }

   /**
    * @return string the UUID of the (validated) session
    */
   public function getId()
   {
      return $this->sessionStore->get(\upro\web\SessionHijackPreventer::STORE_ID_KEY);
   }

   /**
    * Creates a hash based on the properties of the remote party.
    * @return string a hash identifying the remote party
    */
   private function getRemoteHash()
   {
      $address = $this->requestServerContext->getRemoteAddress();
      $userAgent = $this->requestServerContext->getUserAgent();

      return md5('addr=' . $address . ';userAgent=' . $userAgent);
   }
}

}