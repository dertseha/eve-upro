<?php
namespace upro\dataModel
{

/**
 * A unique identification of a specific type
 */
class DataEntryId
{
   /**
    * Type of the data entry
    * @var string
    */
   private $entryType;

   /**
    * The key of the data entry
    * @var string (UUID)
    */
   private $key;

   /**
    * Constructor
    * @param string $entryType type of the data entry
    * @param string $key key of the data entry (UUID string)
    */
   function __construct($entryType, $key)
   {
      $this->entryType = $entryType;
      $this->key = $key;
   }

   /**
    * @return string the entry type
    */
   public function getEntryType()
   {
      return $this->entryType;
   }

   /**
    * @return string the key
    */
   public function getKey()
   {
      return $this->key;
   }

   /**
    * Returns true if the given entry id is equal to this one
    * @param \upro\dataModel\DataEntryId $other the other id to compare to
    * @return true if this entry id and the given one are equal
    */
   public function equals(\upro\dataModel\DataEntryId $other)
   {
      return ($this->entryType === $other->getEntryType()) && ($this->key === $other->getKey());
   }

   /**
    * @return string string presentation
    */
   public function toString()
   {
      return $this->entryType . '[' . $this->key . ']';
   }

   /** {@inheritDoc} */
   public function __toString()
   {
      return $this->toString();
   }
}

}