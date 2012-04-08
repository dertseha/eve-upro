<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/StringDataType.php';

/**
 * An UUID data type.
 * Currently strictly based on a StringDataType.
 */
class UuidDataType extends \upro\db\schema\StringDataType
{
   /**
    * Constructor
    */
   function __construct()
   {
      parent::__construct(strlen(\Uuid::EMPTY_UUID));
   }
}

}