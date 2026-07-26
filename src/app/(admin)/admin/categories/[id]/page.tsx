import { prisma } from "@/lib/prisma";
import { EditCategoryForm } from "@/components/admin/edit-category-form";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  // আইডি অনুযায়ী নির্দিষ্ট ক্যাটাগরি ফেচ করা
  const category = await prisma.category.findUnique({
    where: { id: params.id },
  });

  if (!category) return <div>Category not found</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Edit Category</h1>
      {/* এডিট করার জন্য ফর্ম, যেখানে currentCategory হিসেবে পুরনো ডাটা পাস করবেন */}
      <EditCategoryForm currentCategory={category} />
    </div>
  );
}