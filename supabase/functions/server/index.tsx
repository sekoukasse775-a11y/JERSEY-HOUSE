import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-be870e9e/health", (c) => {
  return c.json({ status: "ok" });
});

// PRODUCTS
app.get("/make-server-be870e9e/products", async (c) => {
  const products = await kv.get("jh_products");
  return c.json(products || []);
});
app.put("/make-server-be870e9e/products", async (c) => {
  const body = await c.req.json();
  await kv.set("jh_products", body);
  return c.json({ ok: true });
});

// ORDERS
app.get("/make-server-be870e9e/orders", async (c) => {
  const orders = await kv.get("jh_orders");
  return c.json(orders || []);
});
app.put("/make-server-be870e9e/orders", async (c) => {
  const body = await c.req.json();
  await kv.set("jh_orders", body);
  return c.json({ ok: true });
});

// CUSTOMERS
app.get("/make-server-be870e9e/customers", async (c) => {
  const customers = await kv.get("jh_customers");
  return c.json(customers || []);
});
app.put("/make-server-be870e9e/customers", async (c) => {
  const body = await c.req.json();
  await kv.set("jh_customers", body);
  return c.json({ ok: true });
});

Deno.serve(app.fetch);
