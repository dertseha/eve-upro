<?php
namespace upro\db
{
require_once realpath(dirname(__FILE__)) . '/TableRowReader.php';

/**
 * A TableRowReader ignoring any passed data
 */
final class NullTableRowReader implements \upro\db\TableRowReader
{
   /**
    * Constructor
    */
   function __construct()
   {

   }

   /** {@inheritDoc} */
   public function receive($data)
   {
      // ignored as described
   }

}

}