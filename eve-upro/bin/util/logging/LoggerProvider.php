<?php
namespace upro\util\logging
{
require_once realpath(dirname(__FILE__)) . '/Logger.php';
require_once realpath(dirname(__FILE__)) . '/NullLogger.php';

/**
 * A provider for logger
 */
class LoggerProvider
{
   /**
    * the factory for the logger
    * @var function
    */
   private static $loggerFactory;

   /**
    * Sets the logger factory to use
    * @param unknown_type $factory
    */
   public static function setLoggerFactory($factory)
   {
      \upro\util\logging\LoggerProvider::$loggerFactory = $factory;
   }

   /**
    * Returns a logger instance for the requested context
    * @param string $context the logger context
    * @return \upro\util\logging\Logger the logger for given context
    */
   public static function getLogger($context)
   {
      $factory = \upro\util\logging\LoggerProvider::$loggerFactory;
      $logger = null;

      if (is_null($factory))
      {
         $logger = \upro\util\logging\NullLogger::getInstance();
      }
      else
      {
         $logger = $factory($context);
      }

      return $logger;
   }
}

}
