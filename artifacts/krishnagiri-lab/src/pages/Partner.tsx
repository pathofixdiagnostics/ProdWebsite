import { useSEO } from "@/hooks/useSEO";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitPartner } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

const partnerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  organizationName: z.string().min(2, "Organization name is required"),
  organizationType: z.enum(['hospital', 'clinic', 'doctor', 'healthCenter', 'collectionCenter']),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(2, "City is required"),
  message: z.string().optional(),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

export default function Partner() {
  useSEO({
    title: "Partner With Us",
    description: "Partner with Krishnagiri Diagnostic Laboratory. We welcome hospitals, clinics, and collection centers.",
  });

  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const submitMutation = useSubmitPartner();

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      fullName: "",
      organizationName: "",
      email: "",
      phone: "",
      city: "",
      message: "",
    }
  });

  const onSubmit = (data: PartnerFormValues) => {
    submitMutation.mutate({ data }, {
      onSuccess: () => {
        setIsSuccess(true);
        form.reset();
      },
      onError: (err) => {
        toast({
          title: "Error submitting form",
          description: err.error || "Please try again later.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="w-full pb-16 sm:pb-20 overflow-x-hidden">
      <section className="bg-slate-900 pt-16 sm:pt-20 pb-24 sm:pb-32 text-center text-white relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Partner With Us</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join our network of healthcare excellence. We partner with hospitals, clinics, and doctors to provide reliable diagnostic support.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-4xl -mt-16 sm:-mt-20 relative z-20 pb-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 sm:p-8 md:p-12">

          {isSuccess ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Thank You!</h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto mb-8">
                Your partnership request has been received. Our team will contact you shortly to discuss collaboration opportunities.
              </p>
              <Button onClick={() => setIsSuccess(false)} variant="outline" className="h-11 px-6">
                Submit Another Request
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-100">
                <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary mr-3 sm:mr-4 shrink-0" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Partnership Application</h2>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. John Doe" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Organization Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="City Care Clinic" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="organizationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Organization Type <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hospital">Hospital</SelectItem>
                              <SelectItem value="clinic">Clinic</SelectItem>
                              <SelectItem value="doctor">Independent Doctor</SelectItem>
                              <SelectItem value="healthCenter">Health Center</SelectItem>
                              <SelectItem value="collectionCenter">Collection Center</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">City <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Krishnagiri" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Email Address <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@clinic.com" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Phone Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="10-digit number" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your requirements..."
                            className="min-h-[110px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base font-semibold h-12 sm:h-14"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
