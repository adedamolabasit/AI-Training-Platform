// app/trainer/page.tsx
"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Activity, Upload, Settings, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Types for our training configuration
type FrameworkConfig = {
  name: string;
  libraries: string[];
  defaultParams: Record<string, any>;
};

type TrainingConfig = {
  framework: string;
  library: string;
  dataset: File | null;
  params: Record<string, any>;
  computeType: string;
  customScript: string;
};

export default function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState("datasets");
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    framework: "",
    library: "",
    dataset: null,
    params: {},
    computeType: "gpu",
    customScript: ""
  });
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [useCustomScript, setUseCustomScript] = useState(false);

  // Available frameworks and their libraries
  const frameworks: Record<string, FrameworkConfig> = {
    pytorch: {
      name: "PyTorch",
      libraries: ["Transformers", "Lightning", "TorchText", "Custom"],
      defaultParams: {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 10,
        optimizer: "Adam"
      }
    },
    tensorflow: {
      name: "TensorFlow",
      libraries: ["Keras", "TF Text", "TF Transform", "Custom"],
      defaultParams: {
        learningRate: 0.001,
        batchSize: 64,
        epochs: 10,
        optimizer: "Adam"
      }
    },
    jax: {
      name: "JAX",
      libraries: ["Flax", "Haiku", "Trax", "Custom"],
      defaultParams: {
        learningRate: 0.001,
        batchSize: 128,
        epochs: 10,
        optimizer: "Adam"
      }
    },
    sklearn: {
      name: "Scikit-learn",
      libraries: ["Standard", "Custom"],
      defaultParams: {
        testSize: 0.2,
        randomState: 42
      }
    }
  };

  const handleFrameworkChange = (value: string) => {
    const newConfig = {
      ...trainingConfig,
      framework: value,
      library: frameworks[value]?.libraries[0] || "",
      params: frameworks[value]?.defaultParams || {}
    };
    setTrainingConfig(newConfig);
  };

  const handleLibraryChange = (value: string) => {
    setTrainingConfig({
      ...trainingConfig,
      library: value
    });
  };

  const handleParamChange = (param: string, value: any) => {
    setTrainingConfig({
      ...trainingConfig,
      params: {
        ...trainingConfig.params,
        [param]: value
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTrainingConfig({
        ...trainingConfig,
        dataset: e.target.files[0]
      });
    }
  };

  const startTraining = async () => {
    if (!trainingConfig.dataset) {
      alert("Please upload a dataset first");
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLogs([]);

    try {
      const formData = new FormData();
      formData.append('framework', trainingConfig.framework);
      formData.append('library', trainingConfig.library);
      formData.append('computeType', trainingConfig.computeType);
      formData.append('useCustomScript', String(useCustomScript));
      formData.append('params', JSON.stringify(trainingConfig.params));
      
      if (trainingConfig.dataset) {
        formData.append('dataset', trainingConfig.dataset);
      }
      
      if (useCustomScript && trainingConfig.customScript) {
        formData.append('customScript', trainingConfig.customScript);
      }

      const response = await fetch('/api/train', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Training failed');
      }

      // Simulate progress updates (in a real app, you'd use WebSockets or polling)
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsTraining(false);
            return 100;
          }
          return newProgress;
        });

        setTrainingLogs(prev => [
          ...prev,
          `Epoch ${Math.floor(trainingProgress / 10)} completed - Loss: ${(Math.random() * 0.5).toFixed(4)}`
        ]);
      }, 2000);

    } catch (error) {
      console.error('Training error:', error);
      setIsTraining(false);
      setTrainingLogs(prev => [...prev, "Training failed: " + (error as Error).message]);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-6">AI Trainer Dashboard</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Your Dataset</CardTitle>
                    <CardDescription>Upload CSV, JSON, or text files for training</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="dataset-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <Upload className="h-5 w-5" />
                          <span>Choose File</span>
                        </div>
                        <Input 
                          id="dataset-upload" 
                          type="file" 
                          className="hidden" 
                          accept=".csv,.json,.txt,.parquet"
                          onChange={handleFileUpload}
                        />
                      </Label>
                      {trainingConfig.dataset && (
                        <span className="text-sm">{trainingConfig.dataset.name}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Configuration</CardTitle>
                  <CardDescription>
                    Configure your training parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="framework">Framework</Label>
                    <Select onValueChange={handleFrameworkChange} value={trainingConfig.framework}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(frameworks).map(key => (
                          <SelectItem key={key} value={key}>{frameworks[key].name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {trainingConfig.framework && (
                    <div className="space-y-2">
                      <Label htmlFor="library">Library</Label>
                      <Select onValueChange={handleLibraryChange} value={trainingConfig.library}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select library" />
                        </SelectTrigger>
                        <SelectContent>
                          {frameworks[trainingConfig.framework].libraries.map(lib => (
                            <SelectItem key={lib} value={lib}>{lib}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="compute">Compute Type</Label>
                    <Select 
                      onValueChange={(value) => setTrainingConfig({...trainingConfig, computeType: value})}
                      value={trainingConfig.computeType}
                    >
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

                  {trainingConfig.framework && trainingConfig.library && (
                    <div className="space-y-4 pt-2">
                      <h4 className="font-medium">Training Parameters</h4>
                      {Object.entries(trainingConfig.params).map(([param, value]) => (
                        <div key={param} className="space-y-1">
                          <Label htmlFor={param}>{param}</Label>
                          <Input
                            id={param}
                            type={typeof value === 'number' ? 'number' : 'text'}
                            value={value}
                            onChange={(e) => handleParamChange(
                              param, 
                              typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="custom-script" 
                        checked={useCustomScript} 
                        onCheckedChange={setUseCustomScript} 
                      />
                      <Label htmlFor="custom-script">Use Custom Training Script</Label>
                    </div>
                    {useCustomScript && (
                      <Textarea
                        placeholder="Paste your custom training script here..."
                        value={trainingConfig.customScript}
                        onChange={(e) => setTrainingConfig({
                          ...trainingConfig,
                          customScript: e.target.value
                        })}
                        className="min-h-[100px]"
                      />
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={startTraining}
                    disabled={isTraining || !trainingConfig.dataset}
                  >
                    <Play className="mr-2 h-4 w-4" /> 
                    {isTraining ? "Training..." : "Start Training"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                  <CardDescription>
                    {isTraining ? "Training in progress" : "No active training"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isTraining ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(trainingProgress)}%</span>
                        </div>
                        <Progress value={trainingProgress} />
                      </div>

                      <div className="space-y-2">
                        <Label>Training Logs</Label>
                        <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                          {trainingLogs.length > 0 ? (
                            trainingLogs.map((log, index) => (
                              <div key={index} className="text-sm font-mono py-1">
                                {log}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Waiting for training logs...
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center space-y-2">
                        <Settings className="h-8 w-8 mx-auto" />
                        <p>Configure and start a training job</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {trainingConfig.dataset && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dataset Preview</CardTitle>
                    <CardDescription>
                      First 5 rows of your dataset
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                      <div className="text-sm text-muted-foreground">
                        Dataset preview would be shown here
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline">View Details</Button>
                        <Button variant="outline">
                          <FileText className="mr-2 h-4 w-4" /> View Logs
                        </Button>
                        <Button>Deploy</Button>
                      </div>
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