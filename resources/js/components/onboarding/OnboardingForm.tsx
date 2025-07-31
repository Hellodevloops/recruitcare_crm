// components/onboarding/OnboardingForm.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface FormData {
    companyName: string;
    fullName: string;
    email: string;
    subscription: string;
    teamSize: string;
}

const steps = [
    { id: 1, title: "Company Details", description: "Let's start with your company" },
    { id: 2, title: "Personal Info", description: "Tell us about yourself" },
    { id: 3, title: "Plan Selection", description: "Choose your perfect plan" },
];

export default function OnboardingForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        companyName: "",
        fullName: "",
        email: "",
        subscription: "",
        teamSize: "",
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const validateStep = () => {
        const newErrors: Partial<FormData> = {};

        if (step === 1 && !formData.companyName) {
            newErrors.companyName = "Company name is required";
        }
        if (step === 2) {
            if (!formData.fullName) newErrors.fullName = "Full name is required";
            if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Valid email is required";
            }
        }
        if (step === 3 && !formData.subscription) {
            newErrors.subscription = "Please select a plan";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep()) {
            console.log("Form submitted:", formData);
            // Add your API call here
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.5, ease: "easeIn" } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {steps[step - 1].title}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {steps[step - 1].description}
                        </p>
                    </motion.div>
                    <Progress value={(step / steps.length) * 100} className="mt-4" />
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-sm font-medium">
                                            Company Name
                                        </Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Acme Inc."
                                            className={errors.companyName ? "border-red-500" : ""}
                                        />
                                        {errors.companyName && (
                                            <p className="text-red-500 text-xs">{errors.companyName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="teamSize" className="text-sm font-medium">
                                            Team Size
                                        </Label>
                                        <Select onValueChange={handleSelectChange("teamSize")} value={formData.teamSize}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select team size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-5">1-5 members</SelectItem>
                                                <SelectItem value="6-20">6-20 members</SelectItem>
                                                <SelectItem value="21+">21+ members</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-sm font-medium">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="e.g., John Doe"
                                            className={errors.fullName ? "border-red-500" : ""}
                                        />
                                        {errors.fullName && (
                                            <p className="text-red-500 text-xs">{errors.fullName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="e.g., john@company.com"
                                            className={errors.email ? "border-red-500" : ""}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-xs">{errors.email}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Subscription Plan</Label>
                                        <Select onValueChange={handleSelectChange("subscription")} value={formData.subscription}>
                                            <SelectTrigger className={errors.subscription ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Choose your plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="basic">
                                                    <div className="flex items-center gap-2">
                                                        <span>Basic</span>
                                                        <span className="text-muted-foreground">$9/mo</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="pro">
                                                    <div className="flex items-center gap-2">
                                                        <span>Pro</span>
                                                        <span className="text-muted-foreground">$29/mo</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="enterprise">
                                                    <div className="flex items-center gap-2">
                                                        <span>Enterprise</span>
                                                        <span className="text-muted-foreground">$99/mo</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.subscription && (
                                            <p className="text-red-500 text-xs">{errors.subscription}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    <CardFooter className="flex justify-between pt-6">
                        {step > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                className="group"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </Button>
                        )}
                        {step < steps.length ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="ml-auto group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                Next
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="ml-auto group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            > Get Started
                                <CheckCircle2 className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                            </Button>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}