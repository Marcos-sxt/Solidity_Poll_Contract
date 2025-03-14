
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Context";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkWarning } from "@/components/NetworkWarning";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Loader2, Vote } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PollOption {
  text: string;
  votes: number;
}

interface PollData {
  title: string;
  options: PollOption[];
  totalVotes: number;
}

const PollDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { contract, isConnected } = useWeb3();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPoll = async () => {
      if (contract && id) {
        setIsLoading(true);
        try {
          const [title, optionTexts, optionVotes] = await contract.getPoll(id);
          
          const options = optionTexts.map((text: string, index: number) => ({
            text,
            votes: parseInt(optionVotes[index].toString())
          }));
          
          const totalVotes = options.reduce((sum: number, option: PollOption) => sum + option.votes, 0);
          
          setPoll({
            title,
            options,
            totalVotes
          });
        } catch (error) {
          console.error("Error loading poll:", error);
          toast({
            title: "Error",
            description: "Failed to load poll data. Please check the contract address and poll ID.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPoll();
  }, [contract, id, toast]);

  const handleVote = async (optionIndex: number) => {
    if (!contract || !isConnected || !id) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to vote.",
        variant: "destructive"
      });
      return;
    }

    setSelectedOption(optionIndex);
    setIsVoting(true);

    try {
      const tx = await contract.vote(id, optionIndex);
      
      toast({
        title: "Vote Submitted",
        description: "Your vote is being recorded on the blockchain...",
      });
      
      await tx.wait();
      
      // Refresh poll data
      const [title, optionTexts, optionVotes] = await contract.getPoll(id);
      
      const options = optionTexts.map((text: string, index: number) => ({
        text,
        votes: parseInt(optionVotes[index].toString())
      }));
      
      const totalVotes = options.reduce((sum: number, option: PollOption) => sum + option.votes, 0);
      
      setPoll({
        title,
        options,
        totalVotes
      });
      
      toast({
        title: "Vote Recorded!",
        description: "Your vote has been successfully recorded.",
      });
    } catch (error: any) {
      console.error("Error voting:", error);
      toast({
        title: "Error Voting",
        description: error.message || "An error occurred while recording your vote.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
      setSelectedOption(null);
    }
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Vote className="h-8 w-8 text-vote-primary" />
            <h1 className="text-2xl font-bold text-gray-900">EtherVote</h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <NetworkWarning />
        
        <div className="mb-6">
          <Link to="/" className="flex items-center text-vote-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to All Polls
          </Link>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : poll ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">{poll.title}</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Results</h3>
                
                <div className="space-y-6">
                  {poll.options.map((option, index) => {
                    const percentage = calculatePercentage(option.votes, poll.totalVotes);
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{option.text}</p>
                          <div className="flex items-center">
                            <p className="text-gray-600">{option.votes} votes</p>
                            <span className="mx-2">|</span>
                            <p className="font-bold">{percentage}%</p>
                          </div>
                        </div>
                        
                        <Progress value={percentage} className="h-3 bg-gray-200" indicatorClassName="bg-gradient-vote" />
                      </div>
                    );
                  })}
                </div>
                
                <p className="mt-4 text-gray-600 text-sm">Total votes: {poll.totalVotes}</p>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Cast Your Vote</h3>
                
                {!isConnected ? (
                  <div className="text-center p-4">
                    <p className="mb-4 text-gray-600">Connect your wallet to vote</p>
                    <ConnectButton />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {poll.options.map((option, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                          <Button
                            onClick={() => handleVote(index)}
                            disabled={isVoting}
                            className={`w-full p-6 h-auto justify-start rounded-none ${
                              selectedOption === index 
                                ? 'bg-vote-primary text-white' 
                                : 'bg-white hover:bg-vote-background text-gray-900'
                            }`}
                          >
                            {isVoting && selectedOption === index ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Voting...
                              </>
                            ) : (
                              <>
                                {selectedOption === index && (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                {option.text}
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Poll Not Found</h3>
              <p className="text-gray-600 mb-6">
                The poll you're looking for does not exist or there was an error loading it.
              </p>
              <Link to="/">
                <Button className="bg-gradient-vote hover:opacity-90">
                  Return Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>EtherVote - Secure Blockchain Voting</p>
        </div>
      </footer>
    </div>
  );
};

export default PollDetail;
