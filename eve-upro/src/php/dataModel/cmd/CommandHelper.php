<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';

/**
 * A helper for commands
 */
class CommandHelper
{
   /**
    * Returns an UUID string that is based on given parameters
    * @param string $modelId The UUID of the model
    * @param string $name some primary identifier to create the key
    */
	public static function getDerivedKey($modelId, $name)
	{
	   return \Uuid::v5($modelId, $name);
	}

	/**
	 * Returns an UUID string that identifies the (unique) admin title group of given model.
	 * @param string $modelId The UUID of the model
	 */
	public static function getAdminTitleGroupId($modelId)
	{
	   $name = \upro\dataModel\DataModelConstants::GROUP_TYPE_TITLE;

	   return \upro\dataModel\cmd\CommandHelper::getDerivedKey($modelId, $name);
	}

	/**
	 * Finds a user entry by given name
	 * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess the data access to query the entry
	 * @param string $userName the unique user name to look for
	 * @return \upro\dataModel\DataEntry|null the found user entry
	 */
	public static function findUserByName(\upro\dataModel\cmd\CommandDataAccess $dataAccess, $userName)
	{
	   $modelId = new \upro\dataModel\DataEntryId('DataModel', $dataAccess->getModelId());
	   $userEntries = $dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_USER,
	         $modelId, array(\upro\dataModel\DataModelConstants::USER_DATA_NAME => $userName));
	   $userEntryCount = count($userEntries);
	   $userEntry = null;

	   if ($userEntryCount == 1)
	   {
	      $userEntry = $userEntries[0];
	   }

	   return $userEntry;
	}
}

}