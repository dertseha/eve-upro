<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/ColumnDefinition.php';


/**
 * Controlling a column
 */
interface ColumnControl extends \upro\db\schema\ColumnDefinition
{
   /**
    * @param boolean $nullable whether the column can be null
    * @return \upro\db\schema\ColumnControl this
    */
   function setNullable($nullable);

   /**
    * @param mixed $value the default value for the column
    * @return \upro\db\schema\ColumnControl this
    */
   function setDefaultValue($value);
}

}