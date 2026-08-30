import type { Order } from "./types";

const PREFIX = "order:";

export async function listOrders(env: { DATA: KVNamespace }): Promise<Order[]> {
  const { keys } = await env.DATA.list({ prefix: PREFIX });
  const values = await Promise.all(
    keys.map(async (k) => {
      const raw = await env.DATA.get(k.name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Omit<Order, "key">;
      return { ...parsed, key: k.name } as Order;
    })
  );
  return values.filter((v): v is Order => v !== null);
}

export async function getOrder(
  env: { DATA: KVNamespace },
  key: string
): Promise<Order | null> {
  const raw = await env.DATA.get(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Omit<Order, "key">;
  return { ...parsed, key };
}

export async function putOrder(
  env: { DATA: KVNamespace },
  order: Order
): Promise<void> {
  const { key, ...value } = order;
  await env.DATA.put(key, JSON.stringify(value));
}

export async function createOrder(
  env: { DATA: KVNamespace },
  order: Omit<Order, "key">
): Promise<void> {
  const key = `${PREFIX}${order.id}`;
  await env.DATA.put(key, JSON.stringify(order));
}

export async function deleteOrder(env: { DATA: KVNamespace }, key: string): Promise<void> {
  await env.DATA.delete(key);
}

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ordersToCsv(orders: Order[]): string {
  const header = [
    "クライアント名",
    "サービス種別",
    "金額",
    "受注日",
    "納期",
    "進捗ステータス",
    "入金状況",
    "入金日",
    "メモ",
  ];
  const rows = [...orders]
    .sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1))
    .map((o) =>
      [
        o.clientName,
        o.serviceType,
        o.amount,
        o.orderDate,
        o.dueDate,
        o.status,
        o.paymentStatus,
        o.paidDate,
        o.notes,
      ]
        .map(csvCell)
        .join(",")
    );
  // Excelで文字化けしないようUTF-8 BOMを付与
  const BOM = String.fromCharCode(0xfeff);
  return BOM + [header.join(","), ...rows].join("\r\n") + "\r\n";
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export type RevenueSummary = {
  thisMonthRevenue: number;
  yearToDateRevenue: number;
  unpaidTotal: number;
  unpaidCount: number;
  pipelineTotal: number;
  quotingCount: number;
  inProgressCount: number;
  deliveredCount: number;
  overdueCount: number;
  monthly: { month: string; total: number; count: number }[];
};

export function computeRevenue(orders: Order[]): RevenueSummary {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);
  const thisYear = today.slice(0, 4);

  const paidOrders = orders.filter((o) => o.paymentStatus === "入金済み" && o.paidDate);

  const monthlyMap = new Map<string, { total: number; count: number }>();
  for (const o of paidOrders) {
    const m = monthKey(o.paidDate);
    const entry = monthlyMap.get(m) ?? { total: 0, count: 0 };
    entry.total += o.amount;
    entry.count += 1;
    monthlyMap.set(m, entry);
  }
  const monthly = [...monthlyMap.entries()]
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => b.month.localeCompare(a.month));

  const thisMonthRevenue = monthlyMap.get(thisMonth)?.total ?? 0;
  const yearToDateRevenue = monthly
    .filter((m) => m.month.startsWith(thisYear))
    .reduce((sum, m) => sum + m.total, 0);

  const unpaidOrders = orders.filter((o) => o.paymentStatus === "未入金" && o.status !== "キャンセル");
  const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + o.amount, 0);
  const unpaidCount = unpaidOrders.length;

  const pipelineTotal = orders
    .filter((o) => o.status === "見積もり中" || o.status === "進行中")
    .reduce((sum, o) => sum + o.amount, 0);

  const quotingCount = orders.filter((o) => o.status === "見積もり中").length;
  const inProgressCount = orders.filter((o) => o.status === "進行中").length;
  const deliveredCount = orders.filter((o) => o.status === "納品済み").length;

  const overdueCount = orders.filter(
    (o) => o.status !== "納品済み" && o.status !== "キャンセル" && o.dueDate && o.dueDate < today
  ).length;

  return {
    thisMonthRevenue,
    yearToDateRevenue,
    unpaidTotal,
    unpaidCount,
    pipelineTotal,
    quotingCount,
    inProgressCount,
    deliveredCount,
    overdueCount,
    monthly,
  };
}
