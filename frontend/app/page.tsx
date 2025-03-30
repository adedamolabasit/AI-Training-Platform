import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: Database,
      title: "Data Contributors",
      description: "Upload and manage datasets with flexible pricing and access rules",
      href: "/dashboard/contributor"
    },
    {
      icon: Brain,
      title: "AI Trainers",
      description: "Access datasets and train models with advanced monitoring",
      href: "/dashboard/trainer"
    },
    {
      icon: Shield,
      title: "Model Verification",
      description: "Verify model provenance and training history with ZK proofs",
      href: "/verify"
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1">
        <div className="px-4 py-12 md:py-24 lg:py-32 xl:py-48">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Decentralized AI Training Platform
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Secure, transparent, and verifiable AI model training with decentralized datasets
              </p>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/dashboard/contributor">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/verify">Verify Models</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="relative group overflow-hidden">
                <CardHeader>
                  <feature.icon className="w-8 h-8 mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={feature.href}>Learn More</Link>
                  </Button>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}