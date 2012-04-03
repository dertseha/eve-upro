<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/TableControl.php';

require_once realpath(dirname(__FILE__)) . '/../Connection.php';
require_once realpath(dirname(__FILE__)) . '/StandardColumnControl.php';

/**
 * A standard table control implementation
 */
class StandardTableControl implements \upro\db\schema\TableControl
{
   /**
    * @var string Name of the table
    */
   private $tableName;

   private $columnNames;

   private $columns;

   /**
    * Constructor
    * @param string $tableName name of the table
    */
   function __construct($tableName)
   {
      $this->tableName = $tableName;
      $this->columnNames = array();
      $this->columns = array();
   }

   /** {@inheritDoc */
   public function getTableName()
   {
      return $this->tableName;
   }

   /** {@inheritDoc */
   public function getColumnNames()
   {
      return $this->columnNames;
   }

   /** {@inheritDoc */
   public function getColumn($columnName)
   {
      return $this->columns[$columnName];
   }

   /** {@inheritDoc */
   public function addColumn($columnName, $dataType)
   {
      $control = new \upro\db\schema\StandardColumnControl($columnName, $dataType);

      $this->columnNames[] = $columnName;
      $this->columns[$columnName] = $control;

      return $control;
   }

   /** {@inheritDoc */
   function dropColumn($columnName)
   {

      return $this;
   }
}

}