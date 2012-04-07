<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/../NullTableRowReader.php';

require_once realpath(dirname(__FILE__)) . '/SimpleResultSetHandler.php';


/**
 * A result set handler providing the NullTableRowReader
 */
final class NullResultSetHandler extends SimpleResultSetHandler
{
   /**
    * Constructor
    */
   function __construct()
   {
      parent::__construct(new \upro\db\NullTableRowReader());
   }
}

}