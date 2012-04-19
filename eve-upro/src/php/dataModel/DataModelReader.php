<?php
namespace upro\dataModel
{

/**
 * A reader of an entire data model. It is used in combination of
 * ReadAccess.readDataModel()
 */
interface DataModelReader
{
   /**
    * Receives one entry of the data model
    */
   function receiveDataEntry(\upro\dataModel\DataEntry $entry);
}

}