// 6 May 2021 version without users tracking
// gurugeek


import faunadb, { query as q } from "faunadb";
import fetch from "node-fetch";


const Redirect = async (userRequest, userResponse) => {
  const { FAUNADB_SECRET: faunadb_secret } = process.env;
  const shortcode = userRequest.url.replace("/", "") || "__default__";
  const client = new faunadb.Client({ secret: faunadb_secret });

  userResponse.send(faunadb_secret);
  const redirectInfo = await client
    .query(q.Paginate(q.Match(q.Ref("indexes/redirect"), shortcode)))
    .then(response => {
      const redirectRefs = response.data;
      const getAllRedirectDataQuery = redirectRefs.map(ref => {
        return q.Get(ref);
      });
      return client.query(getAllRedirectDataQuery);
    })
    .catch(error => userResponse.send("Not found"));

  if (redirectInfo.length != 1 || !redirectInfo[0].data.dest) {
    // Too much, not enough, or invalid data
    userResponse.send("Not found");
  } else {

    // Redirect user to dest
    userResponse.writeHead(301, { Location: redirectInfo[0].data.dest });
  }

  userResponse.end();
};

export default Redirect;
