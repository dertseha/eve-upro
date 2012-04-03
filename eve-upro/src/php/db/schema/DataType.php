<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/../sql/SqlTextable.php';

/**
 * A data type
 */
interface DataType
{
   /**
    * @return the SQL text presentation of the type
    */
   function getSqlText();
}

}