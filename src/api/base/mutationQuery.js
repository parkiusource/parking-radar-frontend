import Axios from 'axios';

export const mutationQuery = (params) => {
  return Axios(params);
};
