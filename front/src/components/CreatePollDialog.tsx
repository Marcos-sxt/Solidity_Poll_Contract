
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, Loader2 } from "lucide-react";

export function CreatePollDialog() {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const { contract, isConnected } = useWeb3();
  const { toast } = useToast();

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast({
        title: "Cannot Remove",
        description: "A poll must have at least two options.",
        variant: "destructive"
      });
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your poll.",
        variant: "destructive"
      });
      return;
    }

    // Check if there are at least two non-empty options
    const validOptions = options.filter(option => option.trim() !== "");
    if (validOptions.length < 2) {
      toast({
        title: "Not Enough Options",
        description: "Please provide at least two valid options.",
        variant: "destructive"
      });
      return;
    }

    if (!contract || !isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const tx = await contract.createPoll(title, validOptions);
      toast({
        title: "Transaction Sent",
        description: "Your poll is being created. Please wait for confirmation.",
      });
      
      await tx.wait();
      
      toast({
        title: "Poll Created!",
        description: "Your new poll has been successfully created.",
      });
      
      // Reset form
      setTitle("");
      setOptions(["", ""]);
      setOpen(false);
      
      // Give some time for the blockchain to update before refreshing
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error Creating Poll",
        description: error.message || "An error occurred while creating your poll.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-vote hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a New Poll</DialogTitle>
          <DialogDescription>
            Create a new poll that others can vote on.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Poll Title</h4>
            <Input
              placeholder="Enter poll title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Poll Options</h4>
            <p className="text-sm text-gray-500">Add at least two options for voters to choose from</p>
            
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              disabled={isSubmitting}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Option
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-vote hover:opacity-90">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Poll"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
