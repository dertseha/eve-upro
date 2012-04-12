<?php
namespace upro\dataModel
{
/**
 * A read access is for retrieving data from to the model.
 */
interface ReadAccess
{
   /**
    * @return the current data model instance
    */
   function getCurrentInstanceId();

}

}