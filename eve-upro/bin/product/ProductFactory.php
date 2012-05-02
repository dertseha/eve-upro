<?php
namespace upro\product
{

/**
 * The factory for the basic product elements
 */
interface ProductFactory
{
   /**
    * Returns an active connection to the data model database. The caller
    * takes responsibility over the connection.
    * @return \upro\db\Connection the opened connection
    */
   function getDatabaseConnection();

   /**
    * @return \upro\dataModel\db\DatabaseDataModelDefinition the definition of the product
    */
   function getDataModelDefinition();
}

}