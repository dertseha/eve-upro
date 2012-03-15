<?php
namespace upro\db\mysql
{
require_once realpath(dirname(__FILE__)) . '/../DatabaseException.php';
require_once realpath(dirname(__FILE__)) . '/../DataSource.php';

require_once realpath(dirname(__FILE__)) . '/MySqlHelper.php';
require_once realpath(dirname(__FILE__)) . '/MySqlConnection.php';

/**
 * A MySql specific data source
 */
class MySqlDataSource implements \upro\db\DataSource
{
   /**
    * Server to use for a connect
    * @var string
    */
   private $server;

   /**
    * Constructor
    * @param string $server
    */
   function __construct($server)
   {
      $this->server = $server;
   }

   /** {@inheritDoc} */
   public function getConnection($user, $password)
   {
      $handle = $this->connect($user, $password);
      if (mysql_set_charset('utf8', $handle))
      {
         $connection = new \upro\db\mysql\MySqlConnection($handle);
      }
      else
      {
         \upro\db\mysql\MySqlConnection::closeSilently($handle);
         throw new \upro\db\DatabaseException(mysql_error(), mysql_errno());
      }

      return $connection;
   }

   /**
    * Calls mysql_connect to create a connection
    * @param string $user to use
    * @param string $password to use
    */
   private function connect($user, $password)
   {
      $param = array('server' => $this->server, 'user' => $user, 'password' => $password);
      $wrapper = function ($param)
      {
         return mysql_connect($param['server'], $param['user'], $param['password'], TRUE);
      };

      return MySqlHelper::executeThrowError($wrapper, $param);
   }
}

}
