<?php
namespace upro\dataModel
{

/**
 * The definition describes the properties (and relations) of a data model
 */
interface DataModelDefinition
{
   /**
    * @return array of entry types that fall under a given context type
    */
   function getEntryTypesForContext($contextType);
}

}