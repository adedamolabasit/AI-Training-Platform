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
import { Upload, Database, Settings, Loader2, List, Grid, Eye, Layers, Calendar, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { toast } from "sonner";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import ABI from "../../../abi.json";
import { Skeleton } from "@/components/ui/skeleton";

type FileItem = {
  cid: string;
  name: string;
  fileName: string;
  fileSize: string;
  domain: string;
  license: string;
  access: string;
  visibility: string;
  createdAt: number;
  updatedAt: number;
};

type FileState = {
  fileList: FileItem[];
  totalFiles: number;
};

export default function ContributorDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metaData, setMetaData] = useState({
    name: "",
    domain: "",
    license: "",
    access: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [dataSet, setDataSet] = useState<FileState>();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pulse, setPulse] = useState(false);

  const { writeContract, isSuccess } = useWriteContract();
  const { primaryWallet } = useDynamicContext();
  const { chain } = useAccount();

  const { 
    data: allDataSet, 
    isLoading, 
    isError 
  } = useReadContract({
    abi: ABI.abi,
    address: "0x4e070bb604E544dE53851E5a5fDC4B0086674487",
    functionName: "getAllMetadata",
    args: [0, 100],
  });

  useEffect(() => {
    if (!allDataSet) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setMetaData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setMetaData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!primaryWallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (chain?.id !== 421614) {
      toast.error("Please switch to Arbitrum Sepolia network");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("http://127.0.0.1:5000/api/datasets", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      
      const onChainResult = writeContract({
        address: "0x4e070bb604E544dE53851E5a5fDC4B0086674487",
        abi: ABI.abi,
        functionName: "storeMetadata",
        args: [
          result.cid,
          metaData.name,
          result.fileName,
          parseInt(result.fileSize),
          metaData.domain,
          metaData.license,
          metaData.access,
          "public",
        ],
      });

      if(isSuccess) {
        toast.success("Dataset uploaded successfully!");
        setSelectedFile(null);
        setMetaData({
          name: "",
          domain: "",
          license: "",
          access: "",
        });
      } else {
        toast.error("Something went wrong!");
      }

     
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error uploading dataset");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Database className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No datasets found</h3>
      <p className="text-gray-500 mt-1">
        {activeTab === "all" 
          ? "No datasets have been uploaded yet" 
          : "You haven't uploaded any datasets yet"}
      </p>
      {activeTab !== "upload" && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setActiveTab("upload")}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Dataset
        </Button>
      )}
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className={`h-32 rounded-lg ${pulse ? "animate-pulse" : ""}`} />
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(allDataSet as any)?.map((data: any) => (
        <Card key={data.cid} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg truncate">{data.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="truncate">{data.fileName}</span>
              <span>•</span>
              <span>{data.license}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4 text-gray-500" />
                <span>{formatFileSize(Number(data.fileSize))}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-gray-500" />
                <span className="capitalize">{data.domain}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(Number(data.createdAt))}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  data.visibility === "public"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {data.visibility}
                </span>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" /> View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {(allDataSet as any)?.map((data: any) => (
        <Card key={data.cid}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-medium">{data.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{data.fileName}</span>
                  <span>•</span>
                  <span>{formatFileSize(Number(data.fileSize))}</span>
                  <span>•</span>
                  <span className="capitalize">{data.domain}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  data.visibility === "public"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {data.visibility}
                </span>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" /> View
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`py-10 ${!pulse ? "animate-pulse" : ""}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Contributor Dashboard</h1>
        {activeTab !== "upload" && (
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4 mr-2" /> Grid
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "outline"} 
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" /> List
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="manage">My Datasets</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Datasets</CardTitle>
              <CardDescription>
                Browse all available datasets in the network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoadingSkeleton()
              ) : allDataSet && (allDataSet as any).length > 0 ? (
                viewMode === "grid" ? renderGridView() : renderListView()
              ) : (
                renderEmptyState()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>My Datasets</CardTitle>
              <CardDescription>
                Manage your uploaded datasets and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                renderLoadingSkeleton()
              ) : allDataSet && (allDataSet as any).length > 0 ? (
                viewMode === "grid" ? renderGridView() : renderListView()
              ) : (
                renderEmptyState()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mx-auto w-full flex justify-center">
          <Card className="w-1/2 ">
            <CardHeader>
              <CardTitle>Upload New Dataset</CardTitle>
              <CardDescription>
                Upload your dataset with metadata and set access rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataset">Dataset File</Label>
                  <Input
                    id="dataset"
                    type="file"
                    onChange={handleFileSelect}
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Dataset Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter dataset name"
                    value={metaData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("domain", value)}
                    value={metaData.domain}
                    required
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cv">Computer Vision</SelectItem>
                      <SelectItem value="nlp">Natural Language Processing</SelectItem>
                      <SelectItem value="rl">Reinforcement Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>License Type</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("license", value)}
                    value={metaData.license}
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

                <div className="space-y-2">
                  <Label>Access Type</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("access", value)}
                    value={metaData.access}
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

                <Button type="submit" className="w-full" disabled={isUploading}>
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

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Analytics</CardTitle>
              <CardDescription>
                Track usage and earnings from your datasets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Analytics Coming Soon</h3>
                <p className="text-gray-500 mt-1">
                  We're working on bringing you detailed analytics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}