<?php
namespace upro\util\logging
{
require_once realpath(dirname(__FILE__)) . '/../../io/ValueStore.php';
require_once realpath(dirname(__FILE__)) . '/LoggerProvider.php';
require_once realpath(dirname(__FILE__)) . '/Log4PhpLogger.php';

/**
 * The logging system
 */
class LoggingSystem
{
   /**
    * The subset name of the logging configuration
    * @var string
    */
   const CONFIG_SUBSET_NAME = 'logging.';

   /**
    * The configuration key for the logger class to use
    * @var string
    */
   const CONFIG_KEY_LOGGER_CLASS = 'loggerClass';

   /**
    * The default logger class to use in case of missing configuration
    * @var string
    */
   const DEFAULT_LOGGER_CLASS = '\upro\util\logging\Log4PhpLogger';

   /**
    * Initializes the logging system
    */
   public static function initialize(\upro\io\ValueStore $config)
   {
      $loggingConfig = $config->subset(\upro\util\logging\LoggingSystem::CONFIG_SUBSET_NAME);
      $loggerClass = null;

      if ($loggingConfig->has(\upro\util\logging\LoggingSystem::CONFIG_KEY_LOGGER_CLASS))
      {
         $loggerClass = $loggingConfig->get(\upro\util\logging\LoggingSystem::CONFIG_KEY_LOGGER_CLASS);
      }
      if ($loggerClass == '')
      {
         $loggerClass = \upro\util\logging\LoggingSystem::DEFAULT_LOGGER_CLASS;
      }

      $loggerClass::initialize($loggingConfig);
   }

}

}
