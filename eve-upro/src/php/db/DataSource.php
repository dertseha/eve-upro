<?php
namespace upro\db
{

/**
 * A DataSource provides connections to databases and the corresponding query factories.
 */
interface DataSource
{
	/**
	 * Tries to establish a connection to the data source
	 * @param string $user username to log in
	 * @param string $password of the user
	 * @return \upro\db\Connection the established connection or null
	 */
	function getConnection($user, $password);
}

}