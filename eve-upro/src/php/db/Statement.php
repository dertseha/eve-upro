<?php
namespace upro\db
{

/**
 * A Statement is an executable command for a data source
 */
interface Statement
{
   /**
    * Closes the statement and deallocates internal resources
    */
   function close();

   /**
    * Executes the statement
    * @return TRUE|\upro\db\ResultSet TRUE for completed non-query statements, \upro\db\ResultSet for query results
    * @throws \upro\db\DatabaseException for any error
    */
	function execute();
}

}