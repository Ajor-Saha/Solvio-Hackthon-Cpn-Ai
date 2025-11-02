"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Axios } from "@/config/axios";
import useAuthStore from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Download, Upload, UserPlus, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema for single user form
const singleUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Valid email is required"),
  role: z.enum(["student", "faculty"], {
    required_error: "Role is required",
  }),
});

type SingleUserForm = z.infer<typeof singleUserSchema>;

const EmployeePage = () => {
  const searchParams = useSearchParams();
  const userType = searchParams.get("type") || "student";
  const { user, accessToken } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvResults, setCsvResults] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  // Single user form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SingleUserForm>({
    resolver: zodResolver(singleUserSchema),
    defaultValues: {
      role: userType as "student" | "faculty",
    },
  });

  const selectedRole = watch("role");

  // Handle single user submission
  const onSubmitSingle = async (data: SingleUserForm) => {
    try {
      setIsLoading(true);
      const response = await Axios.post(
        "/api/user-management/add-user",
        {
          ...data,
          departmentId: user?.departmentId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(`${selectedRole} added successfully!`);
        toast.info(
          `Login credentials - Email: ${response.data.data.credentials.email}, Password: ${response.data.data.credentials.password}`,
          { duration: 10000 }
        );
        reset();
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files && files[0]) {
      if (files[0].type === "text/csv" || files[0].name.endsWith(".csv")) {
        setCsvFile(files[0]);
      } else {
        toast.error("Please select a CSV file");
      }
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (files[0].type === "text/csv" || files[0].name.endsWith(".csv")) {
        setCsvFile(files[0]);
      } else {
        toast.error("Please select a CSV file");
      }
    }
  };

  // Handle CSV submission
  const onSubmitCSV = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setIsLoading(true);
      setCsvResults(null);

      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("departmentId", user?.departmentId || "");

      const response = await Axios.post(
        "/api/user-management/add-users-csv",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setCsvResults(response.data.data);
        toast.success(response.data.message);
        setCsvFile(null);
      }
    } catch (error: any) {
      console.error("Error uploading CSV:", error);
      toast.error(error.response?.data?.message || "Failed to upload CSV");
    } finally {
      setIsLoading(false);
    }
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = "firstName,lastName,email,role\nJohn,Doe,john.doe@example.com,student\nJane,Smith,jane.smith@example.com,faculty";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "users_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {userType === "student" ? "Add Students" : "Add Faculty Members"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add users individually or upload multiple users via CSV
          </p>
        </div>
      </div>

      <Tabs defaultValue="single" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Single {userType === "student" ? "Student" : "Faculty"}
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        {/* Single User Form */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add Single {userType === "student" ? "Student" : "Faculty Member"}
              </CardTitle>
              <CardDescription>
                Add a single user to your department. Login credentials will be auto-generated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitSingle)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      placeholder="Enter last name (optional)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => setValue("role", value as "student" | "faculty")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Auto-generated login credentials will be displayed after successful creation.
                    Please save them and share with the user.
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : `Add ${selectedRole}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk CSV Upload */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Bulk Upload Users
              </CardTitle>
              <CardDescription>
                Upload a CSV file to add multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CSV Format Info */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">CSV Format Requirements:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li><strong>firstName</strong>: Required - User's first name</li>
                      <li><strong>lastName</strong>: Optional - User's last name</li>
                      <li><strong>email</strong>: Required - Valid email address</li>
                      <li><strong>role</strong>: Required - Either "student" or "faculty"</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-4">
                <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>

              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />

                  {csvFile ? (
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-green-600">
                        File Selected: {csvFile.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Size: {(csvFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Drop your CSV file here</p>
                      <p className="text-gray-600">or click to browse</p>
                      <p className="text-sm text-gray-500">
                        Supports: .csv files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {csvFile && (
                <Button
                  onClick={onSubmitCSV}
                  disabled={isLoading}
                >
                  {isLoading ? "Uploading..." : "Upload CSV"}
                </Button>
              )}

              {/* Results Display */}
              {csvResults && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Upload Results</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{csvResults.summary?.total || 0}</div>
                        <div className="text-sm text-gray-600">Total Processed</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{csvResults.summary?.successful || 0}</div>
                        <div className="text-sm text-gray-600">Successful</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{csvResults.summary?.failed || 0}</div>
                        <div className="text-sm text-gray-600">Failed</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Failed Users */}
                  {csvResults.failedUsers && csvResults.failedUsers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600">Failed Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {csvResults.failedUsers.map((failedUser: any, index: number) => (
                            <div key={index} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                              <p className="font-medium">{failedUser.email}</p>
                              <p className="text-sm text-red-600">{failedUser.reason}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Successful Users - Show credentials */}
                  {csvResults.successfulUsers && csvResults.successfulUsers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">Successfully Added Users</CardTitle>
                        <CardDescription>
                          Please save these credentials and share them with the respective users.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {csvResults.successfulUsers.map((successUser: any, index: number) => (
                            <div key={index} className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Name:</span> {successUser.user.firstName} {successUser.user.lastName}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span> {successUser.credentials.email}
                                </div>
                                <div>
                                  <span className="font-medium">Password:</span> {successUser.credentials.password}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeePage;
