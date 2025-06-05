import EditPostForm from './EditPostForm';

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditPostForm params={{ id }} />;
}
