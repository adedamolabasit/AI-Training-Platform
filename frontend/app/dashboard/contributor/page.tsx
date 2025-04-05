"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Database, Settings, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type FileItem = {
  cid: string;
  createdAt: number;
  dataPartition: string;
  encryption: boolean;
  fileName: string;
  fileSizeInBytes: number;
  id: string;
  lastUpdate: number;
  mimeType: string;
  publicKey: string;
  sentForDeal: string;
};

type FileState = {
  fileList: FileItem[];
  totalFiles: number;
};

export default function ContributorDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    license: "",
    access: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [dataSet, setDataSet] = useState<FileState>();
  const [loading, setLoading] = useState(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    const data = new FormData();
    data.append("file", selectedFile);
    data.append("name", formData.name);
    data.append("domain", formData.domain);
    data.append("license", formData.license);
    data.append("access", formData.access);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/datasets", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Success:", result);
      toast.success("Dataset uploaded successfully!");

      // Reset form and switch to manage tab
      setSelectedFile(null);
      setFormData({
        name: "",
        domain: "",
        license: "",
        access: "",
      });
      setActiveTab("manage");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error uploading dataset");
    } finally {
      setIsUploading(false);
    }
  };

  const getAllDataSet = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/api/datasets", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setDataSet(result);
      console.log("Success:", result);
    } catch (e: any) {
      toast.error("Error fetching dataset:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  useEffect(() => {
    if (activeTab === "all") {
      getAllDataSet();
    }
  }, [activeTab]);

  if (activeTab === "manage" && !dataSet) {
    return (
      <div className="flex space-x-2 w-full items-full">
        <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse delay-200"></div>
        <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse delay-400"></div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold mb-6">Data Contributor Dashboard</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="manage">Manage Datasets</TabsTrigger>
          <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Datasets ({dataSet?.totalFiles})</CardTitle>
              <CardDescription>
                Manage your uploaded datasets and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {dataSet?.fileList.map((data) => {
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle>Image Classification Dataset</CardTitle>
                        <CardDescription>
                          {data.fileName} • MIT License
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <Database className="h-4 w-4" />
                          <span>{formatFileSize(data.fileSizeInBytes)}</span>
                        </div>
                        <Button variant="outline">
                          <Settings className="mr-2 h-4 w-4" /> Manage
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="flex justify-center space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Dataset</CardTitle>
              <CardDescription>
                Upload your dataset with metadata and set access rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="grid w-full max-w-sm items-center gap-4">
                  <Label htmlFor="dataset">Dataset File</Label>
                  <Input
                    id="dataset"
                    type="file"
                    onChange={handleFileSelect}
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="grid w-full max-w-sm items-center gap-4">
                  <Label htmlFor="name" className="mt-4">
                    Dataset Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter dataset name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="grid w-full max-w-sm items-center gap-4">
                  <Label htmlFor="domain" className="mt-4">
                    Domain
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("domain", value)
                    }
                    value={formData.domain}
                    required
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cv">Computer Vision</SelectItem>
                      <SelectItem value="nlp">
                        Natural Language Processing
                      </SelectItem>
                      <SelectItem value="rl">Reinforcement Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full max-w-sm items-center gap-4">
                  <Label htmlFor="license" className="mt-4">
                    License Type
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("license", value)
                    }
                    value={formData.license}
                    required
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mit">MIT</SelectItem>
                      <SelectItem value="apache">Apache 2.0</SelectItem>
                      <SelectItem value="gpl">GPL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full max-w-sm items-center gap-4">
                  <Label htmlFor="access" className="mt-4">
                    Access Type
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("access", value)
                    }
                    value={formData.access}
                    required
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select access type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Pay-per-use</SelectItem>
                      <SelectItem value="dao">DAO-governed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full max-w-sm mt-6"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Dataset
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Your Datasets ({dataSet?.totalFiles})</CardTitle>
              <CardDescription>
                Manage your uploaded datasets and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Image Classification Dataset</CardTitle>
                    <CardDescription>
                      1000 labeled images • MIT License
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Database className="h-4 w-4" />
                      <span>2.3 GB</span>
                    </div>
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" /> Manage
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Analytics</CardTitle>
              <CardDescription>
                Track usage and earnings from your datasets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
