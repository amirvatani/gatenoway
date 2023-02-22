import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5, // testing time
  iterations: 10, // concurrent users
};

export default function () {
  const res = http.get("http://localhost:8080/api/users?page=2", {
    headers: {
      "x-access-token":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjc3MDU0MDQzLCJleHAiOjE2NzcwNjQwNDN9.XSfcxFwDnNqk9fbO6d9188pBP9xLNUSpTqD9CZpgE-E",
    },
  });
  console.log(res.status, "status");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
}
