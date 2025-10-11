import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, Vote, Award, TrendingUp } from "lucide-react";

export const AdminAnalytics = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersResult, votesResult, candidatesResult, certificatesResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("votes").select("id", { count: "exact", head: true }),
        supabase.from("candidates").select("id, name, vote_count").order("vote_count", { ascending: false }).limit(5),
        supabase.from("certificates").select("id", { count: "exact", head: true })
      ]);

      return {
        totalUsers: usersResult.count || 0,
        totalVotes: votesResult.count || 0,
        topCandidates: candidatesResult.data || [],
        totalCertificates: certificatesResult.count || 0
      };
    },
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Vote className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Votes</p>
              <p className="text-2xl font-bold">{stats?.totalVotes || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certificates</p>
              <p className="text-2xl font-bold">{stats?.totalCertificates || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Candidates</p>
              <p className="text-2xl font-bold">{stats?.topCandidates?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Top 5 Candidates by Votes</h4>
        <div className="space-y-4">
          {stats?.topCandidates?.map((candidate, index) => (
            <div key={candidate.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold">{candidate.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{candidate.vote_count}</p>
                <p className="text-sm text-muted-foreground">votes</p>
              </div>
            </div>
          ))}
          {(!stats?.topCandidates || stats.topCandidates.length === 0) && (
            <p className="text-center text-muted-foreground py-8">No voting data yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};
