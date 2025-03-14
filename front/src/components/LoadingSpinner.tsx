
import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <Loader2 className="h-16 w-16 animate-spin text-vote-primary opacity-70" />
      <p className="mt-4 text-lg text-gray-500">Loading...</p>
    </div>
  );
}
