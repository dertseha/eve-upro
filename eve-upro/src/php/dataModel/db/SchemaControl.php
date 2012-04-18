<?php
namespace upro\dataModel\db
{

/**
 * A control for working with the DB schema with regards to a data model
 */
interface SchemaControl
{
   /**
    * @return boolean true if the schema is up to date
    */
   function isUpToDate();

   /**
    * Requests the schema to be up to date
    */
   function update();
}

}