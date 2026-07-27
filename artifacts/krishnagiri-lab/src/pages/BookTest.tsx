import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Home, MapPin, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useSubmitBooking } from "@workspace/api-client-react";
import { TEST_PACKAGES, BUSINESS_DETAILS } from "@/config/data";
import { useSEO } from "@/hooks/useSEO";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const TIME_SLOTS = [
  { value: "08:00-09:00", label: "8:00 AM – 9:00 AM" },
  { value: "09:00-10:00", label: "9:00 AM – 10:00 AM" },
  { value: "10:00-11:00", label: "10:00 AM – 11:00 AM" },
  { value: "11:00-12:00", label: "11:00 AM – 12:00 PM" },
  { value: "12:00-13:00", label: "12:00 PM – 1:00 PM" },
  { value: "13:00-14:00", label: "1:00 PM – 2:00 PM" },
  { value: "14:00-15:00", label: "2:00 PM – 3:00 PM" },
  { value: "15:00-16:00", label: "3:00 PM – 4:00 PM" },
  { value: "16:00-17:00", label: "4:00 PM – 5:00 PM" },
  { value: "17:00-18:00", label: "5:00 PM – 6:00 PM" },
  { value: "18:00-19:00", label: "6:00 PM – 7:00 PM" },
  { value: "19:00-20:00", label: "7:00 PM – 8:00 PM" },
];

const formSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  testPackage: z.string().min(1, "Please select a test package"),
  customTestName: z.string().optional(),
  preferredDate: z.string().min(1, "Please select a date"),
  preferredTimeSlot: z.string().min(1, "Please select a time slot"),
  collectionType: z.enum(["homeCollection", "labDropIn"]),
  address: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.collectionType === "homeCollection" && (!data.address || data.address.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Address is required for home collection",
      path: ["address"],
    });
  }
  if (data.testPackage === "other" && (!data.customTestName || data.customTestName.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the test name",
      path: ["customTestName"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function BookTest() {
  useSEO({
    title: "Book a Test",
    description: "Book a blood test or full body checkup at PATHOFIX DIAGNOSTICS Krishnagiri. Home sample collection available. Fast, accurate results.",
  });

  const [bookingId, setBookingId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      phone: "",
      email: "",
      testPackage: "",
      customTestName: "",
      preferredDate: "",
      preferredTimeSlot: "",
      collectionType: "labDropIn",
      address: "",
      notes: "",
    },
  });

  const submitBooking = useSubmitBooking();
  const collectionType = form.watch("collectionType");
  const testPackage = form.watch("testPackage");
  const preferredDate = form.watch("preferredDate");

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  const minDateStr = today.toISOString().split("T")[0];
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // For today's date, filter out slots whose start hour has already passed.
  const availableSlots = useMemo(() => {
    if (!preferredDate || preferredDate !== minDateStr) return TIME_SLOTS;
    const nowHour = new Date().getHours();
    return TIME_SLOTS.filter((slot) => {
      const startHour = parseInt(slot.value.split(":")[0], 10);
      return startHour > nowHour;
    });
  }, [preferredDate, minDateStr]);

  // Clear the time slot if it falls outside the available set after a date change.
  useEffect(() => {
    const current = form.getValues("preferredTimeSlot");
    if (current && !availableSlots.find((s) => s.value === current)) {
      form.setValue("preferredTimeSlot", "");
    }
  }, [availableSlots, form]);

  const onSubmit = (data: FormValues) => {
    submitBooking.mutate(
      {
        data: {
          patientName: data.patientName,
          phone: data.phone,
          email: data.email || null,
          testPackage: data.testPackage === "other" && data.customTestName ? data.customTestName : data.testPackage,
          preferredDate: data.preferredDate,
          collectionType: data.collectionType,
          preferredTimeSlot: data.preferredTimeSlot as any,
          address: data.address || null,
          notes: data.notes || null,
        },
      },
      {
        onSuccess: (res) => {
          setBookingId(res.bookingId);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Booking Failed",
            description: "There was an error submitting your booking. Please try again.",
          });
        },
      }
    );
  };

  if (bookingId) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-green-100 bg-green-50/50 shadow-lg">
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center px-4 sm:px-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Booking Confirmed!</h2>
              <p className="text-base sm:text-lg text-slate-600 mb-6 max-w-md">
                Your booking has been received. We will confirm your appointment shortly.
              </p>
              <div className="bg-white border border-green-100 rounded-xl px-6 py-4 mb-8 shadow-sm w-full max-w-xs">
                <p className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-wider">Booking Reference ID</p>
                <p className="text-2xl font-bold text-slate-900">#{bookingId}</p>
              </div>
              <Button className="w-full max-w-xs rounded-full h-12" onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3">Book a Test</h1>
        <p className="text-base sm:text-lg text-slate-600">
          Fill out the form below to schedule your diagnostic test.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Patient Details */}
          <div className="space-y-5 bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center border-b border-slate-100 pb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-xs sm:text-sm shrink-0">1</div>
              Patient Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Full Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="h-11" />
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
                      <Input placeholder="10-digit mobile number" type="tel" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Test Details */}
          <div className="space-y-5 bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center border-b border-slate-100 pb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-xs sm:text-sm shrink-0">2</div>
              Test Selection
            </h3>

            <FormField
              control={form.control}
              name="testPackage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Select Test or Package <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose a package or test" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEST_PACKAGES.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.name}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other (Specify below)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AnimatePresence>
              {testPackage === "other" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <FormField
                    control={form.control}
                    name="customTestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Test Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the test you need" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold leading-none">Collection Type <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card
                  className={`cursor-pointer transition-all border-2 ${collectionType === 'labDropIn' ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'}`}
                  onClick={() => form.setValue("collectionType", "labDropIn")}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${collectionType === 'labDropIn' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Visit our lab</h4>
                    <p className="text-xs text-slate-500">{BUSINESS_DETAILS.address}</p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all border-2 ${collectionType === 'homeCollection' ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'}`}
                  onClick={() => form.setValue("collectionType", "homeCollection")}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${collectionType === 'homeCollection' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">We come to you</h4>
                    <p className="text-xs text-slate-500">Trained phlebotomist visits your home</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <AnimatePresence>
              {collectionType === "homeCollection" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Collection Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your full address with landmark"
                            className="min-h-[90px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Schedule */}
          <div className="space-y-5 bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center border-b border-slate-100 pb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-xs sm:text-sm shrink-0">3</div>
              Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Preferred Date <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          min={minDateStr}
                          max={maxDateStr}
                          {...field}
                          className="pl-10 h-11"
                        />
                        <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTimeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Preferred Time <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <Clock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSlots.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-slate-400">
                            No slots available for today.<br />Please select a future date.
                          </div>
                        ) : (
                          availableSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special instructions or symptoms to mention"
                      {...field}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-full shadow-lg shadow-primary/25"
            disabled={submitBooking.isPending}
          >
            {submitBooking.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Submitting Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
