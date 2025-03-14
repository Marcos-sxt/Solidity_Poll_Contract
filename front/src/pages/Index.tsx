
import { useState, useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { PollCard } from "@/components/PollCard";
import { ConnectButton } from "@/components/ConnectButton";
import { ContractAddressInput } from "@/components/ContractAddressInput";
import { CreatePollDialog } from "@/components/CreatePollDialog";
import { NetworkWarning } from "@/components/NetworkWarning";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Vote, Database, GithubIcon } from "lucide-react";

interface Poll {
  id: string;
  title: string;
}

const Index = () => {
  const { contract, isConnected, contractAddress } = useWeb3();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPolls = async () => {
      if (contract && contractAddress !== "0x0000000000000000000000000000000000000000") {
        setIsLoading(true);
        try {
          const [pollIds, titles] = await contract.getAllPolls();
          
          const pollsList = pollIds.map((id: any, index: number) => ({
            id: id.toString(),
            title: titles[index]
          }));
          
          setPolls(pollsList);
        } catch (error) {
          console.error("Error loading polls:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPolls();
  }, [contract, contractAddress]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Vote className="h-8 w-8 text-vote-primary" />
            <h1 className="text-2xl font-bold text-gray-900">EtherVote</h1>
          </div>
          <div className="flex items-center gap-2">
            <ContractAddressInput />
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <NetworkWarning />
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Decentralized Voting Platform</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create and vote on polls using blockchain technology for maximum transparency and security.
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
            <Database className="h-16 w-16 text-vote-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet to Start</h3>
            <p className="text-gray-600 mb-6">
              Connect your Ethereum wallet to create polls and cast your votes.
            </p>
            <ConnectButton />
          </div>
        ) : contractAddress === "0x0000000000000000000000000000000000000000" ? (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
            <Database className="h-16 w-16 text-vote-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Set Contract Address</h3>
            <p className="text-gray-600 mb-6">
              Please set your Poll contract address to interact with your polls.
            </p>
            <ContractAddressInput />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">All Polls</h3>
              <CreatePollDialog />
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : polls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map((poll) => (
                  <PollCard key={poll.id} id={poll.id} title={poll.title} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Vote className="h-12 w-12 text-vote-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Polls Found</h3>
                <p className="text-gray-600 mb-6">
                  There are no polls in this contract yet. Create the first one!
                </p>
                <CreatePollDialog />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">EtherVote - Secure Blockchain Voting</p>
          <div className="flex justify-center items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-vote-primary transition-colors">
              <GithubIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
