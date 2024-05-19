// fetchData.js
console.log('coming from fetchData.js');

export async function fetchACSIncomeData() {
  const apiKey = "74a87d99b53d3b3effd2bd3148493f810c40bb5e";
  const baseQueryURL = "https://api.census.gov/data/2019/acs/acs5";
  const fields = "B19013_001E,NAME";
  const state = "06";  // State code for California
  const counties = ["037", "059"];  // Los Angeles and Orange County
  const incomeDataByTract = {};

  try {
    for (const county of counties) {
      const queryURL = `${baseQueryURL}?get=${fields}&for=tract:*&in=state:${state}+county:${county}&key=${apiKey}`;
      const response = await fetch(queryURL);
      const data = await response.json();

      if (response.ok) {
        data.slice(1).forEach((row) => {
          const tractCode = `${row[2].padStart(2, '0')}${row[3].padStart(3, '0')}${row[4].padStart(6, '0')}`;
          incomeDataByTract[tractCode] = {
            medianIncome: row[0] === '-' ? null : parseInt(row[0], 10),
            tractName: row[1],
          };
        });
      } else {
        throw new Error(`Failed to fetch data for county ${county}: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error("Error fetching ACS income data:", error);
  }

  return incomeDataByTract;
}

export async function fetchLACensusTracts() {
  const queryURL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/8/query?where=STATE='06' AND (COUNTY='037' OR COUNTY='059')&outFields=*&outSR=4326&f=geojson";

  try {
    const response = await fetch(queryURL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching LA and Orange County metro census tracts:", error);
  }
}
