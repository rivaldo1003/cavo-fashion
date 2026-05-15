import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "products.json");

function getProducts() {
  const data = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(data);
}

function saveProducts(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, productId, size, stokBaru, type } = body;

  const data = getProducts();

  if (action === "update-stok") {
    if (type === "faith") {
      const product = data.faithArchives.find((p: any) => p.id === productId);
      if (product && product.stok[size] !== undefined) {
        product.stok[size] = stokBaru;
        product.totalStok = (Object.values(product.stok) as number[]).reduce(
          (a: number, b: number) => a + b,
          0,
        );
        saveProducts(data);
        return NextResponse.json({ success: true, product });
      }
    } else if (type === "essentials") {
      if (data.essentials.stok[size] !== undefined) {
        data.essentials.stok[size] = stokBaru;
        data.essentials.totalStok = (
          Object.values(data.essentials.stok) as number[]
        ).reduce((a, b) => a + b, 0);
        saveProducts(data);
        return NextResponse.json({ success: true, product: data.essentials });
      }
    }
  }

  return NextResponse.json({ error: "Action not found" }, { status: 400 });
}
