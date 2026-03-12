export default async function Page({ params }: { params: { product: string } }) {
  const { product } = await params;
  return (
    <div className="mt-10">
      <h1>{product}</h1>
      <p>This is the product detail page.</p>
    </div>
  );
}
