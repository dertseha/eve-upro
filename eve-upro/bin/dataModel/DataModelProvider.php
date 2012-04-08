<?php
namespace upro\dataModel
{

/**
 * A provider for getting access to model control
 */
interface DataModelProvider
{
   /**
    * Returns true when a model with given name exists
    * @param unknown_type $name the name of the model to check
    * @return boolean true if existing
    */
   function isModelExisting($name);

   /**
    * Creates a new data model with given name
    * @param string $name the name of the new model
    */
   function createDataModel($name);

   /**
    * Retrieves a write context for given model
    * @param string $name
    * @return \upro\dataModel\WriteContext the context to use
    */
   function getWriteContext($name);

   /**
    * Retrieves a read context for given model
    * @param string $name
    * @return \upro\dataModel\ReadContext the context to use
    */
   function getReadContext($name);

}

}