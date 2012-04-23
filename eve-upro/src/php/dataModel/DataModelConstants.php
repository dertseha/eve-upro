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
   const USER_DATA_OPEN_ID_HASH = 'openIdHash';

   const ENTRY_TYPE_CLIENT_SESSION = 'ClientSession';
   const CLIENT_SESSION_DATA_LAST_ALIVE_TIME = 'lastAliveTime';
}

}