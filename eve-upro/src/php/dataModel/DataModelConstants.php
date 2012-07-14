<?php
namespace upro\dataModel
{

/**
 * A container class providing various constants for the generic data model
 */
class DataModelConstants
{
   const ENTRY_TYPE_GROUP = 'DataModelGroup';
   const GROUP_DATA_GROUP_TYPE = 'groupType';
   const GROUP_DATA_DATA_MODEL_ID = 'dataModelId';
   const GROUP_DATA_VALID_FROM = 'validFromInstance';
   const GROUP_DATA_VALID_TO = 'validToInstance';

   const ENTRY_TYPE_GROUP_INTEREST = 'GroupInterest';
   const GROUP_INTEREST_DATA_VALID_FROM = 'validFromInstance';
   const GROUP_INTEREST_DATA_VALID_TO = 'validToInstance';
   const GROUP_INTEREST_DATA_DATA_MODEL_ID = 'dataModelId';
   const GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE = 'interestEntryType';
   const GROUP_INTEREST_DATA_INTEREST_ID = 'interestId';
   const GROUP_INTEREST_DATA_CONTROLLED = 'controlled';

   const ENTRY_TYPE_GROUP_MEMBERSHIP = 'GroupMembership';
   const GROUP_MEMBERSHIP_DATA_VALID_FROM = 'validFromInstance';
   const GROUP_MEMBERSHIP_DATA_VALID_TO = 'validToInstance';
   const GROUP_MEMBERSHIP_DATA_DATA_MODEL_ID = 'dataModelId';
   const GROUP_MEMBERSHIP_DATA_USER_ID = 'userId';

   const ENTRY_TYPE_USER = 'User';
   const USER_DATA_NAME = 'name';
   const USER_DATA_STATE = 'state';
   const USER_DATA_TAG = 'tag';

   const ENTRY_TYPE_CLIENT_SESSION = 'ClientSession';
   const CLIENT_SESSION_DATA_LAST_ALIVE_TIME = 'lastAliveTime';

   const ENTRY_TYPE_ROLE = 'Role';
   const ROLE_DATA_NAME = 'name';

   const ENTRY_TYPE_TITLE = 'Title';
   const TITLE_DATA_NAME = 'name';

   const GROUP_TYPE_TITLE = 'Title';

   const ROLE_NAME_CREATE_TITLE = 'CreateTitle';

   /**
    * @return array an array of all role names the system knows
    */
   public static function getRoleNames()
   {
      $class = new \ReflectionClass('\upro\dataModel\DataModelConstants');
      $roleNames = array();
      $roleKeyPrefix = 'ROLE_NAME_';

      foreach ($class->getConstants() as $key => $value)
      {
         if (strcmp(substr($key, 0, strlen($roleKeyPrefix)), $roleKeyPrefix) === 0)
         {
            $roleNames[] = $value;
         }
      }

      return $roleNames;
   }
}

}