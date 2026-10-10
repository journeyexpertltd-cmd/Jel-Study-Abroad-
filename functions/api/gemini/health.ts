// Public deployment-route probe. Never reveals credentials or customer data.
export const onRequestGet = async (): Promise<Response> =>
  Response.json({
    app: "Journey Expert Angela",
    routeMarker: "jel-bd-angela-health-20261010",
    status: "pages-function-reachable",
    time: new Date().toISOString(),
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
