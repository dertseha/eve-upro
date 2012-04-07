<?php
namespace upro\db\mysql
{
require_once realpath(dirname(__FILE__)) . '/../Connection.php';
require_once realpath(dirname(__FILE__)) . '/../BufferTableRowReader.php';

require_once realpath(dirname(__FILE__)) . '/../sql/StandardSqlDictionary.php';

require_once realpath(dirname(__FILE__)) . '/MySqlHelper.php';
require_once realpath(dirname(__FILE__)) . '/MySqlPreparedStatement.php';
require_once realpath(dirname(__FILE__)) . '/MySqlResultSet.php';
require_once realpath(dirname(__FILE__)) . '/MySqlTableControlProvider.php';
require_once realpath(dirname(__FILE__)) . '/MySqlTransactionControl.php';

/**
 * A MySql specific connection
 */
class MySqlConnection implements \upro\db\Connection
{
   /**
    * The handle
    */
   private $handle;

   /**
    * The current database name
    * @var string
    */
   private $databaseName;

   /**
    * Constructor
    * @param resource $handle
    */
   function __construct($handle)
   {
      $this->handle = $handle;
      $this->databaseName = '';
   }

   /** {@inheritDoc} */
   public function close()
   {
      if ($this->handle != null)
      {
         MySqlConnection::closeSilently($this->handle);
         $this->handle = null;
      }
   }

   /**
    * Silently closes the given connection handle
    * @param resource $handle to close
    */
   public static function closeSilently($handle)
   {
      try
      {
         mysql_close($handle);
      }
      catch (\Exception $ex)
      {

      }
   }

   /** {@inheritDoc} */
   function getSqlDictionary()
   {
      return new \upro\db\sql\StandardSqlDictionary();
   }

   /** {@inheritDoc} */
   public function setDatabase($databaseName)
   {
      $param = array('databaseName' => $databaseName, 'link' => $this->handle);
      $wrapper = function ($param)
      {
         return mysql_select_db($param['databaseName'], $param['link']);
      };
      MySqlHelper::executeThrowError($wrapper, $param);
      $this->databaseName = $databaseName;
   }

   /** {@inheritDoc} */
   public function getDatabaseName()
   {
      return $this->databaseName;
   }

   /** {@inheritDoc} */
   public function prepareStatement($query)
   {
      $name = MySqlPreparedStatement::createName();
      $escapedQuery = $this->escapeString($query);

      $this->executeIgnoreResult('PREPARE ' . $name . ' FROM "' . $escapedQuery . '"');

      return new MySqlPreparedStatement($this, $name);
   }

   /** {@inheritDoc} */
   public function getTableControlProvider()
   {
      return new \upro\db\mysql\MySqlTableControlProvider($this);
   }

   /** {@inheritDoc} */
   public function getTransactionControl()
   {
      return new \upro\db\mysql\MySqlTransactionControl($this);
   }

   /**
    * Escapes an arbitrary string to be used in an SQL query
    * @param unknown_type $value
    * @return string escaped from SQL injection
    */
   public function escapeString($value)
   {
      $temp = $value;
      if (get_magic_quotes_gpc())
      {
         $temp = stripslashes($temp);
      }

      $param = array('value' => $temp, 'link' => $this->handle);
      $wrapper = function ($param)
      {
         return mysql_real_escape_string($param['value'], $param['link']);
      };

      return MySqlHelper::executeThrowError($wrapper, $param);
   }

   /**
    * Executes the given query, using mysql_unbuffered_query.
    * The caller must ensure that the returned result is read entirely - at least properly closed -
    * before calling anything else.
    * @param string $query to execute
    * @return TRUE|resource the query result
    */
   public function execute($query)
   {
      $param = array('query' => $query, 'link' => $this->handle);
      $wrapper = function ($param)
      {
         return mysql_unbuffered_query($param['query'], $param['link']);
      };
      $result = MySqlHelper::executeThrowError($wrapper, $param);

      return $result;
   }

   /**
    * Executes the given query and drops any result - if given
    * @param string $query to execute
    */
   public function executeIgnoreResult($query)
   {
      $result = $this->execute($query);
      if (is_resource($result))
      {
         MySqlResultSet::closeResult($result);
      }
   }

   /**
    * Returns a string representing the given value in SQL form
    * @param string $value to represent
    */
   public function getTypeBasedString($value)
   {
      if (is_null($value))
      {
         $result = 'NULL';
      }
      else if (is_bool($value))
      {
         $result = $value ? 'TRUE' : 'FALSE';
      }
      else if (is_numeric($value))
      {
         $result = '' . (0 + $value);
      }
      else
      {
         $result = '"' . $this->escapeString($value) . '"';
      }

      return $result;
   }
}

}