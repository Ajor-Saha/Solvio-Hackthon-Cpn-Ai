"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useAuthStore from "@/store/store";
import { BookOpen, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const semesters = [
  { code: "1-1", title: "1st Year, 1st Semester", year: 1, sem: 1 },
  { code: "1-2", title: "1st Year, 2nd Semester", year: 1, sem: 2 },
  { code: "2-1", title: "2nd Year, 1st Semester", year: 2, sem: 1 },
  { code: "2-2", title: "2nd Year, 2nd Semester", year: 2, sem: 2 },
  { code: "3-1", title: "3rd Year, 1st Semester", year: 3, sem: 1 },
  { code: "3-2", title: "3rd Year, 2nd Semester", year: 3, sem: 2 },
  { code: "4-1", title: "4th Year, 1st Semester", year: 4, sem: 1 },
  { code: "4-2", title: "4th Year, 2nd Semester", year: 4, sem: 2 },
];

export default function CourseEnrollmentPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== "department_admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "department_admin") {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Course Enrollment Management</h1>
        <p className="text-muted-foreground">
          Select a semester to manage course enrollments for students and faculty
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {semesters.map((semester) => (
          <Link
            key={semester.code}
            href={`/course-enrollment/${semester.code}`}
            className="transition-transform hover:scale-105"
          >
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">
                    Year {semester.year}/Sem {semester.sem}
                  </CardTitle>
                </div>
                <CardDescription>{semester.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Click to manage enrollments</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
