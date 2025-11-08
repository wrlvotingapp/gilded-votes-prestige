import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings, Users, Vote as VoteIcon, Award, FileText, Image, BarChart3, Newspaper, Calendar, Trophy } from "lucide-react";
import { AdminLogo } from "@/components/admin/AdminLogo";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminSubcategories } from "@/components/admin/AdminSubcategories";
import { AdminCandidates } from "@/components/admin/AdminCandidates";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminCertificates } from "@/components/admin/AdminCertificates";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminNews } from "@/components/admin/AdminNews";
import { AdminAppointments } from "@/components/admin/AdminAppointments";
import { AdminSocialMedia } from "@/components/admin/AdminSocialMedia";
import { AdminRecords } from "@/components/admin/AdminRecords";

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
            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-2">
                <TabsTrigger value="analytics" className="flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="logo" className="flex items-center justify-center">
                  <Image className="w-4 h-4 mr-2" />
                  Logo
                </TabsTrigger>
                <TabsTrigger value="records" className="flex items-center justify-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Records
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="subcategories" className="flex items-center justify-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Subcategories
                </TabsTrigger>
                <TabsTrigger value="candidates" className="flex items-center justify-center">
                  <VoteIcon className="w-4 h-4 mr-2" />
                  Candidates
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center justify-center">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="certificates" className="flex items-center justify-center">
                  <Award className="w-4 h-4 mr-2" />
                  Certificates
                </TabsTrigger>
                <TabsTrigger value="news" className="flex items-center justify-center">
                  <Newspaper className="w-4 h-4 mr-2" />
                  News
                </TabsTrigger>
                <TabsTrigger value="appointments" className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Appointments
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Social Media
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics">
                <AdminAnalytics />
              </TabsContent>

              <TabsContent value="logo">
                <AdminLogo />
              </TabsContent>

              <TabsContent value="records">
                <AdminRecords />
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

              <TabsContent value="news">
                <AdminNews />
              </TabsContent>

              <TabsContent value="appointments">
                <AdminAppointments />
              </TabsContent>

              <TabsContent value="social">
                <AdminSocialMedia />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
