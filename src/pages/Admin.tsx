import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings, Users, Vote as VoteIcon, Award, FileText, Image } from "lucide-react";
import { AdminLogo } from "@/components/admin/AdminLogo";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminSubcategories } from "@/components/admin/AdminSubcategories";
import { AdminCandidates } from "@/components/admin/AdminCandidates";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminCertificates } from "@/components/admin/AdminCertificates";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage all aspects of OWR Votes</p>
          </div>

          <Card className="p-6 bg-card border-border">
            <Tabs defaultValue="logo" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="logo">
                  <Image className="w-4 h-4 mr-2" />
                  Logo
                </TabsTrigger>
                <TabsTrigger value="categories">
                  <Settings className="w-4 h-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="subcategories">
                  <FileText className="w-4 h-4 mr-2" />
                  Subcategories
                </TabsTrigger>
                <TabsTrigger value="candidates">
                  <VoteIcon className="w-4 h-4 mr-2" />
                  Candidates
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="certificates">
                  <Award className="w-4 h-4 mr-2" />
                  Certificates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logo">
                <AdminLogo />
              </TabsContent>

              <TabsContent value="categories">
                <AdminCategories />
              </TabsContent>

              <TabsContent value="subcategories">
                <AdminSubcategories />
              </TabsContent>

              <TabsContent value="candidates">
                <AdminCandidates />
              </TabsContent>

              <TabsContent value="users">
                <AdminUsers />
              </TabsContent>

              <TabsContent value="certificates">
                <AdminCertificates />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
