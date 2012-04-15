<?php
namespace upro\dataModel
{
require_once realpath(dirname(__FILE__)) . '/DataEntryId.php';

/**
 * Some generic data entry, consisting of an ID, a context reference and a collection of properties
 */
class DataEntry
{
   /**
    * The primary key of the entry
    * @var \upro\dataModel\DataEntryId
    */
   private $id;

   /**
    * The key of the context (reference)
    * @var \upro\dataModel\DataEntryId
    */
   private $contextId;

   /**
    * Associative array of properties
    * @var string:mixed
    */
   private $data;

   /**
    * Constructor
    * @param \upro\dataModel\DataEntryId $id primary key
    * @param \upro\dataModel\DataEntryId $contextId reference key of context
    * @param string:mixed $data associative array of properties
    */
   function __construct(\upro\dataModel\DataEntryId $id, \upro\dataModel\DataEntryId $contextId, $data)
   {
      $this->id = $id;
      $this->contextId = $contextId;
      $this->data = $data;
   }

   /**
    * @return \upro\dataModel\DataEntryId the primary key
    */
   public function getId()
   {
      return $this->id;
   }

   /**
    * @return \upro\dataModel\DataEntryId the key of the context
    */
   public function getContextId()
   {
      return $this->contextId;
   }

   /**
    * @return string:mixed the properties of the entry
    */
   public function getData()
   {
      return $this->data;
   }
}

}