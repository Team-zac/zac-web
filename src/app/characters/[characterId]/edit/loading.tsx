import { FormPageSkeleton } from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return <FormPageSkeleton activeKey="characters" fieldCount={10} />;
}
