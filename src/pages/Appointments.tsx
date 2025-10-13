import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const { data: appointments } = useQuery({
    queryKey: ["user-appointments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("appointment_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createAppointment = useMutation({
    mutationFn: async (appointmentData: any) => {
      const { error } = await supabase
        .from("appointments")
        .insert([appointmentData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
      toast({ title: "Appointment request submitted successfully" });
      setName("");
      setEmail("");
      setPhone("");
      setDate("");
      setNote("");
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone || !date) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    createAppointment.mutate({
      user_id: user?.id,
      name,
      email,
      phone,
      appointment_date: date,
      note,
      status: 'pending',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">Book Appointment</h1>
            <p className="text-muted-foreground text-lg">
              Schedule a meeting for record verification
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Book an Appointment</h2>
            
            <Card className="p-6 bg-card border-border">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Appointment Date & Time *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="note">Additional Notes</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Any additional information..."
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-gradient-gold text-background hover:opacity-90"
                  disabled={createAppointment.isPending}
                >
                  {createAppointment.isPending ? "Submitting..." : "Request Appointment"}
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Appointments</h2>
            
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment) => (
                <Card key={appointment.id} className="p-6 bg-card border-border">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{appointment.name}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.email}</p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                      <Clock className="w-4 h-4 ml-4" />
                      <span>{new Date(appointment.appointment_date).toLocaleTimeString()}</span>
                    </div>
                    {appointment.note && (
                      <p className="text-sm text-muted-foreground">{appointment.note}</p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 bg-card border-border text-center">
                <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No appointments scheduled yet.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
