<?php
namespace upro\util\logging
{
require_once realpath(dirname(__FILE__)) . '/Logger.php';
require_once realpath(dirname(__FILE__)) . '/LoggerProvider.php';

/**
 * A logger doing nothing
 */
class NullLogger implements \upro\util\logging\Logger
{
   /**
    * The singleton instance
    * @var \upro\util\logging\NullLogger
    */
   private static $instance;

   /**
    * Constructor
    */
   function __construct()
   {

   }

   /**
    * Initializes the logging system to use this logger
    */
   public static function initialize()
   {
      \upro\util\logging\LoggerProvider::setLoggerFactory(null);
   }

   /**
    * Retrieves the singleton instance
    * @return \upro\util\logging\Logger the logger for given context
    */
   public static function getInstance()
   {
      if (is_null(\upro\util\logging\NullLogger::$instance))
      {
         \upro\util\logging\NullLogger::$instance = new \upro\util\logging\NullLogger();
      }

      return \upro\util\logging\NullLogger::$instance;
   }

   /** {@inheritDoc} */
   public function info($format)
   {

   }

   /** {@inheritDoc} */
   public function warn($format)
   {

   }

   /** {@inheritDoc} */
   public function error($format)
   {

   }
}

}
