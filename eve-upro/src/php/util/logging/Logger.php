<?php
namespace upro\util\logging
{

/**
 * A logger for writing log entries
 */
interface Logger
{
   /**
    * Produces an informational log entry
    * @param string $format the raw string or format string to use. allows additional parameters
    */
   function info($format);

   /**
    * Produces a warning log entry
    * @param string $format the raw string or format string to use. allows additional parameters
    */
   function warn($format);

   /**
    * Produces an error log entry
    * @param string $format the raw string or format string to use. allows additional parameters
    */
   function error($format);
}

}
