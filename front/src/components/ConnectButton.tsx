
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ConnectButton() {
  const { isConnected, connectWallet, address, isWrongNetwork, switchToCorrectNetwork, isLoading } = useWeb3();

  if (isLoading) {
    return (
      <Button disabled className="rounded-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} className="bg-gradient-vote hover:opacity-90 rounded-full">
        Connect Wallet
      </Button>
    );
  }

  if (isWrongNetwork) {
    return (
      <Button 
        onClick={switchToCorrectNetwork} 
        variant="destructive"
        className="rounded-full"
      >
        Switch Network
      </Button>
    );
  }

  return (
    <Button variant="outline" className="rounded-full border-vote-primary text-vote-primary">
      {address?.substring(0, 6)}...{address?.substring(38)}
    </Button>
  );
}
