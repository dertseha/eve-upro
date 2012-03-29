<?php
namespace upro\db\mysql
{
require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../DatabaseException.php';
require_once realpath(dirname(__FILE__)) . '/../PreparedStatement.php';

require_once realpath(dirname(__FILE__)) . '/MySqlHelper.php';
require_once realpath(dirname(__FILE__)) . '/MySqlConnection.php';

/**
 * A MySql specific prepared statement
 */
class MySqlPreparedStatement implements \upro\db\PreparedStatement
{
   /**
    * The connection this statement is bound to
    * @var \upro\db\mysql\MySqlConnection
    */
   private $connection;

   /**
    * The prepared name
    * @var string
    */
   private $name;

   /**
    * how many parameter are set
    * @var int
    */
   private $parameterCount;

   public function __construct($connection, $name)
   {
      $this->connection = $connection;
      $this->name = $name;
      $this->parameterCount = 0;
   }

   /** {@inheritDoc} */
   public function close()
   {
      if ($this->name != '')
      {
         $query = 'DEALLOCATE PREPARE ' . $this->name;

         $this->connection->executeIgnoreResult($query);
         $this->clearParameter(); // ensure no data is left behind
         $this->name = '';
      }
   }

   /** {@inheritDoc} */
   public function execute()
   {
      if ($this->name == '')
      {
         throw new \upro\db\DatabaseException('Statement is closed');
      }
      $query = 'EXECUTE ' . $this->name;

      if ($this->parameterCount > 0)
      {
         $query .= ' USING ';
         for ($index = 0; $index < $this->parameterCount; $index++)
         {
            if ($index > 0)
            {
               $query .= ',';
            }
            $query .= $this->getParameterName($index);
         }
      }

      $result = $this->connection->execute($query);
      if (is_resource($result))
      {
         $result = new MySqlResultSet($result);
      }

      return $result;
   }

   /** {@inheritDoc} */
   public function setParameter($index, $value)
   {
      $this->setParameterInDatabase($index, $value);
      if ($index >= $this->parameterCount)
      {
         $this->parameterCount = $index + 1;
      }
   }

   /** {@inheritDoc} */
   public function clearParameter()
   {
      // Apparently, there is no inverted function to "SET". Hopefully, setting 'null' will clear them.
      for ($index = 0; $index < $this->parameterCount; $index++)
      {
         $this->setParameterInDatabase($index, null);
      }
   }

   /**
    * Sets the parameter with given index to given value
    * @param int $index of the parameter to set
    * @param string $value to set
    */
   private function setParameterInDatabase($index, $value)
   {
      $paramName = $this->getParameterName($index);
      $query = 'SET ' . $paramName . ' = ' . $this->getTypeBasedString($value);

      $this->connection->executeIgnoreResult($query);
   }

   /**
    * Returns a string representing the given value in SQL form
    * @param string $value to represent
    */
   private function getTypeBasedString($value)
   {
      if (is_null($value))
      {
         $result = 'null';
      }
      else if (is_bool($value))
      {
         $result = $value ? 'TRUE' : 'FALSE';
      }
      else if (is_numeric($value))
      {
         $result = 0 + $value;
      }
      else
      {
         $result = '"' . $this->connection->escapeString($value) . '"';
      }

      return $result;
   }

   /**
    * Returns a name for the parameter identified by given index, including the prefix '@'
    * @param int $index for which index the name should be
    * @return name of a parameter
    */
   private function getParameterName($index)
   {
      // On one hand, binding the parameter to the statement name (which by itself is unique),
      // ensuring no spoilover to any other active statement and makes guessing them hard.
      // On the other hand, this creates sort of memory leaks.

      return '@' . $this->name . '_param' . $index;
   }

   /**
    * Creates a unique name for a new prepared statement
    * @return string unique statement name
    */
   public static function createName()
   {
      $uuid = \Uuid::v4();
      $temp = 'stmt' . str_replace('-', '', $uuid);

      return $temp;
   }
}

}