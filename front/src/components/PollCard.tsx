
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";

interface PollCardProps {
  id: string;
  title: string;
}

export function PollCard({ id, title }: PollCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="bg-vote-background text-vote-primary mb-2">
            Poll #{id}
          </Badge>
        </div>
        <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
        <CardDescription className="flex items-center">
          <BarChart2 className="h-4 w-4 mr-1 text-vote-secondary" />
          Click to view results
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
      </CardContent>
      <CardFooter className="border-t pt-4 pb-4 flex justify-between">
        <Link to={`/poll/${id}`} className="w-full">
          <Button variant="secondary" className="w-full">
            View Poll <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
