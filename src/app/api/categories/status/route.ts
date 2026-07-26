// /api/categories/status/route.ts
export async function POST(req: Request) {
  const { id, status } = await req.json();
  
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { status }, // এখানে status ডাটাবেজে সেভ হবে
  });
  
  return Response.json(updatedCategory);
}