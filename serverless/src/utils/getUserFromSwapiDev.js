const axios = require("axios");

exports.getUser = async (id) => {
  try {
    const response = await axios.get(`https://swapi.dev/api/people/${id}/`);
    // console.log(
    //   `Response from https://swapi.dev/api/people/${id}/`,
    //   response.data
    // );
    return { userFromSwapiDev: response.data, userFromSwapiDevId: id };
  } catch (error) {
    console.error(
      `An error has occurred during call to https://swapi.dev/api/people/${id}/`,
      error
    );
    throw Error(
      "An error has occurred during call to https://swapi.dev/api/people/${id}/"
    );
  }
};
