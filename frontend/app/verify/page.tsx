"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, History, Database, GitBranch } from "lucide-react";

export default function VerificationPortal() {
  const [modelId, setModelId] = useState("");

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Model Verification Portal</h1>
          <p className="text-muted-foreground">
            Verify the authenticity and training history of AI models
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Verify Model</CardTitle>
            <CardDescription>
              Enter a Model ID to check its ZK proof and training history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="modelId">Model ID</Label>
                <div className="flex space-x-2">
                  <Input
                    id="modelId"
                    placeholder="Enter Model ID"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                  />
                  <Button>
                    <Shield className="mr-2 h-4 w-4" /> Verify
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {modelId && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-green-500" />
                  ZK Proof Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">Status: <span className="text-green-500">Verified</span></p>
                  <p className="text-sm">Timestamp: April 16, 2024 14:30 UTC</p>
                  <p className="text-sm">Verification Hash: 0x1234...5678</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Training History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <Database className="h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-semibold">Training Datasets</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Large Language Dataset (ID: 0x789...abc)</li>
                        <li>Custom Fine-tuning Data (ID: 0xdef...123)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <GitBranch className="h-5 w-5 mt-1" />
                    <div>
                      <h4 className="font-semibold">Training Parameters</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Framework: PyTorch</div>
                        <div>Epochs: 100</div>
                        <div>Batch Size: 32</div>
                        <div>Learning Rate: 0.001</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}