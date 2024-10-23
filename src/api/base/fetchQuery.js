import Axios from 'axios';

export const fetchQuery =
  (params) =>
  async ({ signal }) => {
    const response = await Axios({ ...params, signal });
    return response.data;
  };
