<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/ColumnControl.php';
require_once realpath(dirname(__FILE__)) . '/DataType.php';

/**
 * A standard column control implementation
 */
class StandardColumnControl implements \upro\db\schema\ColumnControl
{
   /**
    * @var string Name of the column
    */
   private $columnName;

   /**
    * @var \upro\db\schema\DataType type of the column
    */
   private $dataType;

   /**
    * @var boolean whether the column is nullable; Default: true
    */
   private $nullable;

   /**
    * @var mixed default value of the column; Default: NULL
    */
   private $defaultValue;

   /**
    * Constructor
    * @param string $columnName name of the column
    * @param \upro\db\schema\DataType $dataType type of the column
    */
   function __construct($columnName, \upro\db\schema\DataType $dataType)
   {
      $this->columnName = $columnName;
      $this->dataType = $dataType;

      $this->nullable = true;
      $this->defaultValue = null;
   }

   /** {@inheritDoc */
   public function getColumnName()
   {
      return $this->columnName;
   }

   /** {@inheritDoc */
   public function getDataType()
   {
      return $this->dataType;
   }

   /** {@inheritDoc */
   public function isNullable()
   {
      return $this->nullable;
   }

   /** {@inheritDoc */
   public function setNullable($nullable)
   {
      $this->nullable = $nullable;

      return $this;
   }

   /** {@inheritDoc */
   public function getDefaultValue()
   {
      return $this->defaultValue;
   }

   /** {@inheritDoc */
   public function setDefaultValue($value)
   {
      $this->defaultValue = $value;

      return $this;
   }
}

}