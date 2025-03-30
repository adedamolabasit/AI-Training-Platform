"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function TrainerDashboard() {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-6">AI Trainer Dashboard</h1>
      
      <Tabs defaultValue="datasets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="datasets">Browse Datasets</TabsTrigger>
          <TabsTrigger value="training">Training Jobs</TabsTrigger>
          <TabsTrigger value="models">My Models</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Datasets</CardTitle>
              <CardDescription>
                Browse and access datasets for training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input placeholder="Search datasets..." className="max-w-sm" />
                <Button>
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>

              <div className="grid gap-4">
                {/* Example dataset cards */}
                <Card>
                  <CardHeader>
                    <CardTitle>Large Language Dataset</CardTitle>
                    <CardDescription>500GB of processed text data</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div className="space-y-2">
                      <p className="text-sm">License: MIT</p>
                      <p className="text-sm">Access: Pay-per-use</p>
                    </div>
                    <Button>Request Access</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
              <CardDescription>
                Configure and monitor your training jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 max-w-sm">
                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pytorch">PyTorch</SelectItem>
                      <SelectItem value="tensorflow">TensorFlow</SelectItem>
                      <SelectItem value="jax">JAX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="compute">Compute Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select compute type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpu">GPU (NVIDIA A100)</SelectItem>
                      <SelectItem value="tpu">TPU v4</SelectItem>
                      <SelectItem value="cpu">CPU Cluster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>
                  <Play className="mr-2 h-4 w-4" /> Start Training
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Training Jobs</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>BERT Fine-tuning</CardTitle>
                    <CardDescription>Started 2 hours ago</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} />
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          Training loss: 0.342
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Trained Models</CardTitle>
              <CardDescription>
                View and manage your trained models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>GPT-Fine-tuned</CardTitle>
                    <CardDescription>Completed on April 15, 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">Framework: PyTorch</p>
                      <p className="text-sm">Dataset: Custom Text Corpus</p>
                      <p className="text-sm">Final Loss: 0.156</p>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}