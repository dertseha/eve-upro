<?php
namespace upro\db
{

/**
 * A ResultSet is the outcome of a data-querying statement
 */
interface ResultSet
{
   /**
    * Closes the result set and releases the data associated with it
    */
   function close();

   /**
    * Returns the columns in an associative array pointing to the column index
    * @return string:number associative array of column names to index
    */
   function getColumnsByName();

   /**
    * Reads the result set into the given reader until the result set is empty
    * @param \upro\db\TableRowReader $reader to feed
    */
   function read(\upro\db\TableRowReader $reader);
}

}