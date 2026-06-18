// @ts-check

import axios from "axios";

/**
 * Send GraphQL request to GitHub API.
 *
 * @param {import('axios').AxiosRequestConfig['data']} data Request data.
 * @param {import('axios').AxiosRequestConfig['headers']} headers Request headers.
 * @param {boolean=} useFetch Use fetch instead of axios.
 * @returns {Promise<any>} Request response.
 */
const request = (data, headers, useFetch = false) => {
  if (useFetch) {
    if (!headers["User-Agent"]) {
      headers["User-Agent"] = "github-readme-stats";
    }
    return fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    }).then(async (resp) => {
      const contentType = resp.headers.get("Content-Type") || "";
      const isJson = contentType.includes("application/json");
      const responseData = isJson ? await resp.json() : await resp.text();
      return {
        status: resp.status,
        statusText: resp.statusText,
        headers: Object.fromEntries(resp.headers.entries()),
        data: responseData,
      };
    });
  }

  return axios({
    url: "https://api.github.com/graphql",
    method: "post",
    headers,
    data,
  });
};

export { request };
