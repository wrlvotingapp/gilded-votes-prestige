import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

const Appointments = () => {
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

          <Card className="p-8 bg-card border-border animate-fade-in">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">Schedule Your Record Verification</h3>
              <p className="text-muted-foreground">
                Book an appointment with our verification team to officially register your world record.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Date</label>
                  <div className="flex items-center gap-2 p-3 border border-border rounded-md">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Choose a date</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Time</label>
                  <div className="flex items-center gap-2 p-3 border border-border rounded-md">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Choose a time</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-gold text-background hover:opacity-90">
                Book Appointment
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Appointments</h2>
            <Card className="p-6 bg-card border-border animate-fade-in">
              <div className="text-center text-muted-foreground py-8">
                No appointments scheduled yet
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
