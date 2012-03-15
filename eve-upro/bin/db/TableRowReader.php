<?php
namespace upro\db
{

/**
 * A TableRowReader receives rows of a table for processing
 */
interface TableRowReader
{
   /**
    * Reads a received row of data
    * @param array $data array of column values
    */
   function receive($data);

}

}