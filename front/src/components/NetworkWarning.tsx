
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWeb3 } from "@/context/Web3Context";

export function NetworkWarning() {
  const { isWrongNetwork, switchToCorrectNetwork } = useWeb3();

  if (!isWrongNetwork) {
    return null;
  }

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Wrong Network</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span>Please switch to a testnet to interact with this dApp.</span>
        <Button 
          onClick={switchToCorrectNetwork} 
          variant="outline" 
          className="border-white text-white hover:bg-white/20 hover:text-white"
        >
          Switch Network
        </Button>
      </AlertDescription>
    </Alert>
  );
}
