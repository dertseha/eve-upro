<?php
namespace upro\db
{
require_once realpath(dirname(__FILE__)) . '/Statement.php';

/**
 * A prepared statement is a buffered one accepting parameters.
 * Prepared statements can be re-executed with different parameter values.
 */
interface PreparedStatement extends \upro\db\Statement
{
   /**
    * Sets a parameter of a statement with placeholder to a given value
    * @param int $index 0 based index of the parameter to set
    * @param mixed $value value to set
    */
   function setParameter($index, $value);

   /**
    * Resets all parameters to an empty value
    */
   function clearParameter();
}

}