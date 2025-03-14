
import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ContractAddressInput() {
  const { contractAddress, setContractAddress } = useWeb3();
  const [inputAddress, setInputAddress] = useState(contractAddress);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSave = () => {
    if (inputAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setContractAddress(inputAddress);
      setOpen(false);
      toast({
        title: "Contract address updated",
        description: `Set to ${inputAddress.substring(0, 10)}...`,
      });
    } else {
      toast({
        title: "Invalid address",
        description: "Please enter a valid Ethereum contract address",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contract Settings</DialogTitle>
          <DialogDescription>
            Enter the address of your deployed Poll contract.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              id="address"
              placeholder="0x..."
              className="col-span-3"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="bg-gradient-vote hover:opacity-90">
            <Check className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
