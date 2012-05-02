<?php
namespace upro\util\logging
{
require_once realpath(dirname(__FILE__)) . '/../../io/ValueStore.php';
require_once realpath(dirname(__FILE__)) . '/Logger.php';
require_once realpath(dirname(__FILE__)) . '/LoggerProvider.php';

if (file_exists(realpath(dirname(__FILE__)) . '/../../../../lib/php/log4php/src/main/php/Logger.php'))
{   // workspace test case
   require_once realpath(dirname(__FILE__)) . '/../../../../lib/php/log4php/src/main/php/Logger.php';
}
else if (file_exists(realpath(dirname(__FILE__)) . '/../../lib/php/log4php/Logger.php'))
{   // production case
   require_once realpath(dirname(__FILE__)) . '/../../lib/php/log4php/Logger.php';
}
else
{   // fallback for existing log4php
   require_once 'log4php/Logger.php';
}

/**
 * A logger for writing log entries
 */
class Log4PhpLogger implements \upro\util\logging\Logger
{
   /**
    * The subset name of the log4php configuration
    * @var string
    */
   const CONFIG_SUBSET_NAME = 'log4php.';

   /**
    * The configuration key for the log4php configuration value(s)
    * @var string
    */
   const CONFIG_KEY_CONFIGURATION = 'configuration';

   /**
    * The actual logger
    * @var \Logger
    */
   private $log;

   /**
    * Constructor
    * @param \Logger $log
    */
   function __construct($log)
   {
      $this->log = $log;
   }

   /**
    * Initializes the logging subsystem for log4php
    * @param \upro\io\ValueStore $config configuration to extract data from
    */
   public static function initialize(\upro\io\ValueStore $config)
   {
      $loggerConfig = $config->subset(\upro\util\logging\Log4PhpLogger::CONFIG_SUBSET_NAME);
      $log4phpConfig = $loggerConfig->get(\upro\util\logging\Log4PhpLogger::CONFIG_KEY_CONFIGURATION);

      \Logger::configure($log4phpConfig);
      if (isset($_SERVER['REMOTE_ADDR']))
      {   // acceptable hack around any abstraction to log the reference point
         $remoteEndPoint = $_SERVER['REMOTE_ADDR'] . ':' . $_SERVER['REMOTE_PORT'];

         \LoggerMDC::put('remoteEndPoint', $remoteEndPoint);
      }

      \upro\util\logging\LoggerProvider::setLoggerFactory(\upro\util\logging\Log4PhpLogger::getFactory());
   }

   /**
    * @return function ($context) a function creating an instance of a logger
    */
   public static function getFactory()
   {
      $factory = function ($context)
      {
         return \upro\util\logging\Log4PhpLogger::getLogger($context);
      };

      return $factory;
   }

   /**
    * Retrieves an instance for given context
    * @param string $context the log context
    * @return \upro\util\logging\Logger the logger for given context
    */
   public static function getLogger($context)
   {
      $log = \Logger::getLogger($context);

      return new \upro\util\logging\Log4PhpLogger($log);
   }

   /** {@inheritDoc} */
   public function info($format)
   {
      if ($this->log->isInfoEnabled())
      {
         $this->log->info($this->format(func_get_args()));
      }
   }

   /** {@inheritDoc} */
   public function warn($format)
   {
      if ($this->log->isWarnEnabled())
      {
         $this->log->warn($this->format(func_get_args()));
      }
   }

   /** {@inheritDoc} */
   public function error($format)
   {
      if ($this->log->isErrorEnabled())
      {
         $this->log->error($this->format(func_get_args()));
      }
   }

   /**
    * Interprets the given array as a list of parameters for sprintf
    * @param array $arguments to pass to sprintf
    * @return string result of sprintf
    */
   private function format($arguments)
   {
      return call_user_func_array('sprintf', $arguments);
   }
}

}
