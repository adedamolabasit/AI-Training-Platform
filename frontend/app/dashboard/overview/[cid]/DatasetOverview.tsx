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
import { useReadContract, useWriteContract } from "wagmi";
import { Database, Layers, Calendar, FileText, Download, Loader2, ShieldCheck, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ABI from "../../../contractFile/abi.json";
import OBLIGATION_ABI from "../../../contractFile/obligation-abi.json";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

function DatasetOverview() {
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [creatingObligation, setCreatingObligation] = useState(false);
  const [obligation, setObligation] = useState<any>(null);
  const [obligationForm, setObligationForm] = useState({
    provider: "",
    duration: "365",
    redundancy: "3",
    retrievalSpeed: "500",
  });
  const { cid } = useParams();
  const router = useRouter();

  // Fetch dataset
  const { data: datasetData, isLoading } = useReadContract({
    abi: ABI.abi,
    address: "0x0E1419c19b27561808701e0b6C7D7d2b2ccd9EC0",
    functionName: "getMetadataByCID",
    args: [cid],
  });

  // Fetch obligation
  const { data: obligationData } = useReadContract({
    abi: OBLIGATION_ABI.abi,
    address: "0x...", // Your obligation contract address
    functionName: "obligations",
    args: [cid],
  });

  // For creating obligations
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!isLoading) {
      if (datasetData) {
        setDataset(datasetData);
      } else {
        toast.error("Dataset not found");
      }
      setLoading(false);
    }
  }, [isLoading, datasetData, router]);

  useEffect(() => {
    if (obligationData) {
      setObligation(obligationData);
    }
  }, [obligationData]);

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
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/datasets/${cid}`);
      if (!response.ok) throw new Error("Failed to download");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = dataset.fileName || "dataset";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download dataset");
    } finally {
      setDownloading(false);
    }
  };

  const handleCreateObligation = async () => {
    setCreatingObligation(true);
    try {
      writeContract({
        address: "0x...", // Your obligation contract address
        abi: OBLIGATION_ABI.abi,
        functionName: "createObligation",
        args: [
          cid,
          obligationForm.provider,
          Number(obligationForm.duration),
          Number(obligationForm.redundancy),
          Number(obligationForm.retrievalSpeed),
        ],
      }, {
        onSuccess: () => {
          toast.success("Storage guarantee created successfully");
          setObligation({
            cid,
            provider: obligationForm.provider,
            startTime: Math.floor(Date.now() / 1000),
            duration: Number(obligationForm.duration),
            redundancy: Number(obligationForm.redundancy),
            retrievalSpeed: Number(obligationForm.retrievalSpeed),
            status: 0, // Active
          });
        },
        onError: (error) => {
          toast.error("Failed to create storage guarantee");
          console.error("Error creating obligation:", error);
        }
      });
    } finally {
      setCreatingObligation(false);
    }
  };

  const obligationStatus = (status: number) => {
    switch(status) {
      case 0: return "Active";
      case 1: return "Fulfilled";
      case 2: return "Broken";
      case 3: return "Expired";
      default: return "Unknown";
    }
  };

  const getStatusIcon = (status: number) => {
    switch(status) {
      case 0: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 1: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 2: return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 3: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDaysRemaining = (obligation: any) => {
    const elapsed = Math.floor(Date.now() / 1000) - obligation.startTime;
    const remaining = obligation.duration * 86400 - elapsed;
    return Math.max(0, Math.floor(remaining / 86400));
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!dataset) {
    return <NotFoundView />;
  }

  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with dataset title and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{dataset.name}</h1>
            <p className="text-gray-600 mt-2">{dataset.description || "No description available"}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleDownload} disabled={downloading} className="flex-1 md:flex-none">
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 md:flex-none">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {obligation ? "Manage" : "Add"} Guarantee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                {!obligation ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Storage Guarantee Details</DialogTitle>
                      <DialogDescription>
                        Manage your existing storage obligation for this dataset.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Current Status</Label>
                        <div className="flex items-center gap-2">
                          {/* available */}
                          {getStatusIcon(1)}
                          <span className="font-medium">
                            {obligationStatus(1)}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm">Provider</Label>
                          <p className="text-sm font-medium">Akave</p>
                          {/* <p className="text-sm font-medium">{obligation.provider}</p> */}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Days Remaining</Label>
                          <p className="text-sm font-medium">40days</p>
                          {/* <p className="text-sm font-medium">{getDaysRemaining(obligation)}</p> */}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Redundancy</Label>
                          <p className="text-sm font-medium">2x</p>
                          {/* <p className="text-sm font-medium">{obligation.redundancy}x</p> */}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Retrieval Speed</Label>
                          <p className="text-sm font-medium">6ms</p>
                          {/* <p className="text-sm font-medium">{obligation.retrievalSpeed}ms</p> */}
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label>Verification History</Label>
                        <div className="text-sm text-gray-600">
                          Last verified: 2 hours ago
                        </div>
                        <div className="text-sm text-gray-600">
                          Next verification: in 4 hours
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="destructive">Revoke Obligation</Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>Create Storage Guarantee</DialogTitle>
                      <DialogDescription>
                        Ensure your dataset remains available by creating a verifiable storage obligation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Storage Provider</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={obligationForm.provider === "akave" ? "default" : "outline"}
                            onClick={() => setObligationForm({...obligationForm, provider: "akave"})}
                          >
                            Akave
                          </Button>
                          <Button
                            variant={obligationForm.provider === "storj" ? "default" : "outline"}
                            onClick={() => setObligationForm({...obligationForm, provider: "storj"})}
                          >
                            Storj
                          </Button>
                        </div>
                      </div>
                      {!obligationForm.provider && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Storage Duration (days)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min="30"
                              max="3650"
                              value={obligationForm.duration}
                              onChange={(e) => setObligationForm({...obligationForm, duration: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="redundancy">Redundancy Factor</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="redundancy"
                                type="number"
                                min="1"
                                max="10"
                                value={obligationForm.redundancy}
                                onChange={(e) => setObligationForm({...obligationForm, redundancy: e.target.value})}
                              />
                              <span className="text-sm text-gray-500">copies</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="retrievalSpeed">Max Retrieval Speed (ms)</Label>
                            <Input
                              id="retrievalSpeed"
                              type="number"
                              min="100"
                              max="2000"
                              value={obligationForm.retrievalSpeed}
                              onChange={(e) => setObligationForm({...obligationForm, retrievalSpeed: e.target.value})}
                            />
                          </div>
                          <div className="rounded-lg border p-4">
                            <div className="flex justify-between text-sm">
                              <span>Estimated Cost</span>
                              <span className="font-medium">
                                ~${(Number(obligationForm.duration) * 0.02).toFixed(2)}/month
                              </span>
                            </div>
                            <Progress value={Number(obligationForm.redundancy) * 10} className="h-2 mt-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              Based on current network rates and your selected parameters
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleCreateObligation}
                        disabled={!obligationForm.provider || creatingObligation}
                      >
                        {creatingObligation ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Confirm Guarantee"
                        )}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dataset Information Card */}
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium">File Information</h3>
                  <p className="text-sm text-gray-600">
                    {dataset.fileName} • {formatFileSize(Number(dataset.fileSize))}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Layers className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium">Domain</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {dataset.domain}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Database className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium">License</h3>
                  <p className="text-sm text-gray-600">{dataset.license}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium">Upload Date</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(Number(dataset.createdAt))}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Guarantee Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Storage Guarantees</CardTitle>
                <CardDescription>
                  {obligation ? "Active storage obligations" : "Verifiable commitments ensuring data availability"}
                </CardDescription>
              </div>
              {!obligation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Recommended
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {obligation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Provider</Label>
                    <p className="font-medium">{obligation.provider}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Status</Label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(obligation.status)}
                      <span className="font-medium">
                        {obligationStatus(obligation.status)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Days Remaining</Label>
                    <p className="font-medium">{getDaysRemaining(obligation)}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Redundancy</Label>
                    <p className="font-medium">{obligation.redundancy}x copies</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Retrieval Speed</Label>
                    <p className="font-medium">{obligation.retrievalSpeed}ms</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm">Verification History</Label>
                  <div className="text-sm text-gray-600">
                    Last verified: 2 hours ago • Next verification: in 4 hours
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-medium">No Active Storage Guarantees</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Adding a storage obligation increases buyer confidence by guaranteeing 
                    your dataset remains available for the specified duration with verifiable proofs.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Add Guarantee
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        {/* Same dialog content as above */}
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
                      <Info className="mr-2 h-4 w-4" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Access Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Access Type</Label>
                  <p className="font-medium capitalize">{dataset.access}</p>
                </div>
                <div>
                  <Label className="text-sm">Visibility</Label>
                  <p className="font-medium capitalize">{dataset.visibility}</p>
                </div>
                <div>
                  <Label className="text-sm">Content Identifier</Label>
                  <p className="font-mono text-sm break-all">{dataset.cid}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Link href="/dashboard/datasets">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Dataset Not Found</h1>
        <p className="text-gray-600 mb-6">
          The dataset you're looking for doesn't exist or may have been removed.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default DatasetOverview;