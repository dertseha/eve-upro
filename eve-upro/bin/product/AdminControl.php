<?php
namespace upro\product
{

/**
 * Administrative control
 */
interface AdminControl
{
   /**
    * @return boolean true if the database is up to date
    */
   function isDatabaseUpToDate();

   /**
    * Requests to update the database schema
    */
   function updateDatabaseSchema();

   /**
    * Requests to create a new data model with given name
    * @param string $name the name of the new model
    */
   function createDataModel($name);
}

}