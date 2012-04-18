<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/../DatabaseException.php';

require_once realpath(dirname(__FILE__)) . '/DataType.php';
require_once realpath(dirname(__FILE__)) . '/UnknownDataType.php';
require_once realpath(dirname(__FILE__)) . '/StringDataType.php';
require_once realpath(dirname(__FILE__)) . '/IntegerDataType.php';
require_once realpath(dirname(__FILE__)) . '/BooleanDataType.php';

/**
 * General helper for schema related stuff
 */
class SchemaHelper
{
   /**
    * Tries to determine a DataType object from an SQL string
    * @param string $dataTypeString the data type string
    * @return \upro\db\schema\DataType the parsed data type
    */
   public static function parseDataType($dataTypeString)
   {
      $splitType = SchemaHelper::splitDataType($dataTypeString);
      $dataType = null;

      if (strcasecmp($splitType[0], 'VARCHAR') == 0)
      {
         $dataType = new \upro\db\schema\StringDataType(0 + $splitType[1]);
      }
      else if (strcasecmp($splitType[0], 'INT') == 0)
      {
         $dataType = new \upro\db\schema\IntegerDataType();
      }
      else if (strcasecmp($splitType[0], 'BOOLEAN') == 0)
      {
         $dataType = new \upro\db\schema\BooleanDataType();
      }
      else
      {
         $dataType = new \upro\db\schema\UnknownDataType($dataTypeString);
      }

      return $dataType;
   }

   /**
    * Splits a data type into a type and size specification
    * @param string $dataTypeString to split
    * @return array with index 0 the type and index 1 the size
    */
   public static function splitDataType($dataTypeString)
   {
      $pattern = '/([\(])|([\)])/';

      return preg_split($pattern, $dataTypeString);
   }
}

}