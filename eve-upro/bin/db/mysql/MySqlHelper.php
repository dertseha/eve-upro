<?php
namespace upro\db\mysql
{
require_once realpath(dirname(__FILE__)) . '/../DatabaseException.php';

/**
 * A helper for MySql things
 */
class MySqlHelper
{
   /**
    * Executes a closure, catches any excecption or FALSE return values and throws a DatabaseException.
    * Returns the normal result otherwise.
    * @param Closure $func to call
    * @param mixed $param to pass to func
    * @throws \upro\db\DatabaseException if either an exception was thrown or FALSE returned
    * @returns the normal result of the function
    */
   public static function executeThrowError($func, $param)
   {
      $result = FALSE;

      try
      {
         $result = $func($param);
      }
      catch (\Exception $ex)
      {  // Catching exceptions from PHP unit test framework (?)
         throw new \upro\db\DatabaseException($ex->getMessage(), mysql_errno(), $ex);
      }
      if ($result == FALSE)
      {  // Production runtime case
         throw new \upro\db\DatabaseException(mysql_error(), mysql_errno());
      }

      return $result;
   }
}

}
