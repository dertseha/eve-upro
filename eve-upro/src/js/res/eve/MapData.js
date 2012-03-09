/*
 * Initialize the known map data with empty arrays.
 * This allows possibly exclusion of some data dump if the application
 * needs it that way.
 */
upro.res.eve.MapData = {};

upro.res.eve.MapData[9] =
{
   regionData: [],
   constellationData: [],
   solarSystemData: [],
   solarSystemJumpData: []
};

upro.res.eve.MapData[9000001] =
{
   regionData: [],
   constellationData: [],
   solarSystemData: [],
   solarSystemJumpData: []
};
