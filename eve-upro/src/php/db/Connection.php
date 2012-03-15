<?php
namespace upro\db
{

/**
 * A Connection is the carrier for operations with a data source
 */
interface Connection
{
   /**
    * Closes the connection
    */
   function close();

   /**
    * Sets the database to be used for further commands
    * @param mixed $databaseName
    */
   function setDatabase($databaseName);

   /**
    * Returns the name of the database previously selected
    * @return string database name
    */
   function getDatabaseName();

   /**
    * Prepares a statement for later execution, optionally with parameters
    * @param string $query to prepare
    * @return \upro\db\PreparedStatement the prepared statement
    */
   function prepareStatement($query);
}

}