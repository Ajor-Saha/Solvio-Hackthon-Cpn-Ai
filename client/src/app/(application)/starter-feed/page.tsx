"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Axios } from "@/config/axios";
import { env } from "@/config/env";
import {
  Award,
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  ExternalLink,
  Filter,
  GraduationCap,
  MapPin,
  Newspaper,
  Search,
  Trophy
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ResourceItem {
  resourceId: string;
  subjectId: string;
  topicName: string;
  description: string | null;
  resourceTitle: string;
  url: string;
  createdAt: string;
}

interface Job {
  jobId: string;
  title: string;
  description: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  externalUrl: string;
  applicationDeadline?: string;
  status: string;
  createdAt: string;
}

interface Competition {
  competitionId: string;
  title: string;
  description: string;
  type?: string;
  organizerName?: string;
  location?: string;
  eventDate?: string;
  registrationDeadline?: string;
  externalUrl: string;
  status: string;
  createdAt: string;
}

interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  achievementType?: string;
  awardedTo?: string;
  awardingOrganization?: string;
  achievementDate?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
}

interface Research {
  researchId: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  publicationUrl?: string;
  createdAt: string;
}

interface HigherStudy {
  higherStudyId: string;
  title: string;
  description: string;
  institution: string;
  studyType?: string;
  location?: string;
  fieldOfStudy?: string;
  applicationDeadline?: string;
  applicationUrl: string;
  status: string;
  createdAt: string;
}

type AnnouncementType = 'all' | 'jobs' | 'competitions' | 'achievements' | 'research' | 'higher-studies';
type StatusFilter = 'all' | 'active' | 'ongoing' | 'completed';

export default function InsightFeedPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [higherStudies, setHigherStudies] = useState<HigherStudy[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AnnouncementType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const router = useRouter();

  useEffect(() => {
    const fetchAllAnnouncements = async () => {
      try {
        setLoading(true);

        // FIRST - Debug database check
        try {
          const debugRes = await Axios.get(`${env.BACKEND_BASE_URL}/api/debug/database`);
          console.log("🔍 DEBUG - Database contents:", debugRes.data);
        } catch (error) {
          console.log("DEBUG endpoint not available:", error.message);
        }

        // Fetch jobs using public endpoint (students/faculty can access)
        try {
          const jobsRes = await Axios.get(`${env.BACKEND_BASE_URL}/api/jobs`, {
            params: { jobStatus: "all", limit: 100 }
          });
          console.log("Jobs API Response:", jobsRes.data);
          let jobsData = [];
          if (jobsRes.data?.success && jobsRes.data?.data?.data) {
            // The jobs array is at response.data.data.data
            jobsData = jobsRes.data.data.data;
          }
          console.log("✅ Jobs extracted:", jobsData.length, "jobs");
          setJobs(Array.isArray(jobsData) ? jobsData : []);
        } catch (error) {
          console.log("Jobs API not available:", error);
          setJobs([]);
        }

        // Fetch competitions using public endpoint
        try {
          const competitionsRes = await Axios.get(`${env.BACKEND_BASE_URL}/api/competitions`, {
            params: { status: "active", limit: 100 }
          });
          console.log("Competitions API Response:", competitionsRes.data);
          let competitionsData = [];
          if (competitionsRes.data?.success && competitionsRes.data?.data?.data) {
            // The competitions array is at response.data.data.data
            competitionsData = competitionsRes.data.data.data;
          }
          console.log("✅ Competitions extracted:", competitionsData.length, "competitions");
          setCompetitions(Array.isArray(competitionsData) ? competitionsData : []);
        } catch (error) {
          console.log("Competitions API not available:", error);
          setCompetitions([]);
        }

        // Fetch achievements using public endpoint
        try {
          const achievementsRes = await Axios.get(`${env.BACKEND_BASE_URL}/api/achievements`, {
            params: { status: "published", limit: 100 }
          });
          console.log("Achievements API Response:", achievementsRes.data);
          let achievementsData = [];
          if (achievementsRes.data?.success && achievementsRes.data?.data?.data) {
            // The achievements array is at response.data.data.data
            achievementsData = achievementsRes.data.data.data;
          }
          console.log("✅ Achievements extracted:", achievementsData.length, "achievements");
          setAchievements(Array.isArray(achievementsData) ? achievementsData : []);
        } catch (error) {
          console.log("Achievements API not available:", error);
          setAchievements([]);
        }

        // Fetch research using public endpoint
        try {
          const researchRes = await Axios.get(`${env.BACKEND_BASE_URL}/api/research`, {
            params: { status: "published", limit: 100 }
          });
          console.log("Research API Response:", researchRes.data);
          let researchData = [];
          if (researchRes.data?.success && researchRes.data?.data?.data) {
            // The research array is at response.data.data.data
            researchData = researchRes.data.data.data;
          }
          console.log("✅ Research extracted:", researchData.length, "research");
          setResearch(Array.isArray(researchData) ? researchData : []);
        } catch (error) {
          console.log("Research API not available:", error);
          setResearch([]);
        }

        // Fetch higher studies using public endpoint
        try {
          const higherStudiesRes = await Axios.get(`${env.BACKEND_BASE_URL}/api/higher-studies`, {
            params: { status: "active", limit: 100 }
          });
          console.log("Higher Studies API Response:", higherStudiesRes.data);
          let higherStudiesData = [];
          if (higherStudiesRes.data?.success && higherStudiesRes.data?.data?.data) {
            // The higher studies array is at response.data.data.data
            higherStudiesData = higherStudiesRes.data.data.data;
          }
          console.log("✅ Higher Studies extracted:", higherStudiesData.length, "higher studies");
          setHigherStudies(Array.isArray(higherStudiesData) ? higherStudiesData : []);
        } catch (error) {
          console.log("Higher Studies API not available:", error);
          setHigherStudies([]);
        }

      } catch (error) {
        console.error("Failed to load announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnnouncements();
  }, []);

  // Combine and filter all announcements
  const getAllAnnouncements = () => {
    const allItems: Array<{
      id: string;
      type: AnnouncementType;
      title: string;
      description: string;
      status: string;
      createdAt: string;
      data: Job | Competition | Achievement | Research | HigherStudy;
    }> = [];

    // Ensure we have arrays and add jobs
    if ((typeFilter === "all" || typeFilter === "jobs") && Array.isArray(jobs)) {
      jobs.forEach(job => {
        if (job && job.jobId) {
          allItems.push({
            id: job.jobId,
            type: "jobs",
            title: job.title || "Untitled Job",
            description: job.description || "",
            status: job.status || "draft",
            createdAt: job.createdAt || new Date().toISOString(),
            data: job
          });
        }
      });
    }

    // Ensure we have arrays and add competitions
    if ((typeFilter === "all" || typeFilter === "competitions") && Array.isArray(competitions)) {
      competitions.forEach(comp => {
        if (comp && comp.competitionId) {
          allItems.push({
            id: comp.competitionId,
            type: "competitions",
            title: comp.title || "Untitled Competition",
            description: comp.description || "",
            status: comp.status || "draft",
            createdAt: comp.createdAt || new Date().toISOString(),
            data: comp
          });
        }
      });
    }

    // Ensure we have arrays and add achievements
    if ((typeFilter === "all" || typeFilter === "achievements") && Array.isArray(achievements)) {
      achievements.forEach(ach => {
        if (ach && ach.achievementId) {
          allItems.push({
            id: ach.achievementId,
            type: "achievements",
            title: ach.title || "Untitled Achievement",
            description: ach.description || "",
            status: ach.status || "draft",
            createdAt: ach.createdAt || new Date().toISOString(),
            data: ach
          });
        }
      });
    }

    // Ensure we have arrays and add research
    if ((typeFilter === "all" || typeFilter === "research") && Array.isArray(research)) {
      research.forEach(res => {
        if (res && res.researchId) {
          allItems.push({
            id: res.researchId,
            type: "research",
            title: res.title || "Untitled Research",
            description: res.description || "",
            status: res.status || "draft",
            createdAt: res.createdAt || new Date().toISOString(),
            data: res
          });
        }
      });
    }

    // Ensure we have arrays and add higher studies
    if ((typeFilter === "all" || typeFilter === "higher-studies") && Array.isArray(higherStudies)) {
      higherStudies.forEach(hs => {
        if (hs && hs.higherStudyId) {
          allItems.push({
            id: hs.higherStudyId,
            type: "higher-studies",
            title: hs.title || "Untitled Higher Study",
            description: hs.description || "",
            status: hs.status || "draft",
            createdAt: hs.createdAt || new Date().toISOString(),
            data: hs
          });
        }
      });
    }

    // Filter by search term
    let filtered = allItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => {
        if (statusFilter === "active") return item.status === "active";
        if (statusFilter === "ongoing") return item.status === "ongoing" || item.status === "active";
        if (statusFilter === "completed") return item.status === "completed" || item.status === "closed";
        return true;
      });
    }

    // SHUFFLE posts like social media (mix all types together)
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getTypeIcon = (type: AnnouncementType) => {
    switch (type) {
      case "jobs": return <Briefcase className="w-4 h-4" />;
      case "competitions": return <Trophy className="w-4 h-4" />;
      case "achievements": return <Award className="w-4 h-4" />;
      case "research": return <BookOpen className="w-4 h-4" />;
      case "higher-studies": return <GraduationCap className="w-4 h-4" />;
      default: return <Newspaper className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: AnnouncementType) => {
    switch (type) {
      case "jobs": return "bg-blue-500";
      case "competitions": return "bg-orange-500";
      case "achievements": return "bg-green-500";
      case "research": return "bg-purple-500";
      case "higher-studies": return "bg-indigo-500";
      default: return "bg-gray-500";
    }
  };

  // Generate mock frontend-only data for visual appeal
  const getMockData = (type: AnnouncementType) => {
    const views = Math.floor(Math.random() * 500) + 50;
    const applicants = Math.floor(Math.random() * 100) + 10;
    const salary = type === "jobs" ? `$${Math.floor(Math.random() * 50 + 50)}k - $${Math.floor(Math.random() * 100 + 100)}k` : null;
    const prize = type === "competitions" ? `$${Math.floor(Math.random() * 5000 + 1000)}` : null;
    const participants = type === "competitions" ? Math.floor(Math.random() * 200) + 20 : null;

    return { views, applicants, salary, prize, participants };
  };

  const renderAnnouncementCard = (item: ReturnType<typeof getAllAnnouncements>[0]) => {
    const { type, data } = item;
    const mockData = getMockData(type);

    const handleCardClick = () => {
      router.push(`/starter-feed/${type}/${item.id}`);
    };

    return (
      <article
        key={item.id}
        onClick={handleCardClick}
        className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative flex items-start gap-4">
          {/* Icon with animated gradient background */}
          <div className={`shrink-0 w-14 h-14 rounded-xl ${getTypeColor(type)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <div className="scale-125">
              {getTypeIcon(type)}
            </div>
          </div>

          <div className="flex-1 space-y-4 min-w-0">
            {/* Header with badges */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {type.replace("-", " ").toUpperCase()}
                  </Badge>
                  <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-xs">
                    {item.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {item.description}
            </p>

            {/* Type-specific details with enhanced styling */}
            <div className="space-y-3">
              {type === "jobs" && (
                <>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {(data as Job).companyName && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <Building className="w-4 h-4 text-primary" />
                        <span className="font-medium">{(data as Job).companyName}</span>
                      </span>
                    )}
                    {(data as Job).location && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">{(data as Job).location}</span>
                      </span>
                    )}
                    {(data as Job).jobType && (
                      <Badge variant="secondary" className="px-3 py-1.5">
                        {(data as Job).jobType?.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                  {mockData.salary && (
                    <div className="flex items-center gap-2 text-lg font-bold text-green-600 dark:text-green-400">
                      💰 {mockData.salary}/year
                    </div>
                  )}
                  {(data as Job).applicationDeadline && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Deadline: {new Date((data as Job).applicationDeadline!).toLocaleDateString()}</span>
                    </div>
                  )}
                </>
              )}

              {type === "competitions" && (
                <>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {(data as Competition).organizerName && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <Building className="w-4 h-4 text-primary" />
                        <span className="font-medium">{(data as Competition).organizerName}</span>
                      </span>
                    )}
                    {(data as Competition).location && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">{(data as Competition).location}</span>
                      </span>
                    )}
                    {(data as Competition).type && (
                      <Badge variant="secondary" className="px-3 py-1.5">
                        {(data as Competition).type?.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                  {mockData.prize && (
                    <div className="flex items-center gap-2 text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      🏆 Prize Pool: {mockData.prize}
                    </div>
                  )}
                  {mockData.participants && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      👥 <span className="font-semibold">{mockData.participants} participants</span>
                    </div>
                  )}
                  {(data as Competition).eventDate && (
                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Event: {new Date((data as Competition).eventDate!).toLocaleDateString()}</span>
                    </div>
                  )}
                </>
              )}

              {type === "achievements" && (
                <>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {(data as Achievement).awardedTo && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-semibold">
                        <Award className="w-4 h-4" />
                        {(data as Achievement).awardedTo}
                      </span>
                    )}
                    {(data as Achievement).awardingOrganization && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <Building className="w-4 h-4 text-primary" />
                        <span className="font-medium">{(data as Achievement).awardingOrganization}</span>
                      </span>
                    )}
                    {(data as Achievement).achievementType && (
                      <Badge variant="secondary" className="px-3 py-1.5">
                        {(data as Achievement).achievementType?.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                  {(data as Achievement).achievementDate && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Awarded: {new Date((data as Achievement).achievementDate!).toLocaleDateString()}</span>
                    </div>
                  )}
                </>
              )}

              {type === "research" && (
                <>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {(data as Research).startDate && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">Started: {new Date((data as Research).startDate!).toLocaleDateString()}</span>
                      </span>
                    )}
                    {(data as Research).endDate && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">End: {new Date((data as Research).endDate!).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                  {(data as Research).publicationUrl && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-semibold">Published Research Available</span>
                    </div>
                  )}
                </>
              )}

              {type === "higher-studies" && (
                <>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                      <Building className="w-4 h-4 text-primary" />
                      <span className="font-medium">{(data as HigherStudy).institution}</span>
                    </span>
                    {(data as HigherStudy).location && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">{(data as HigherStudy).location}</span>
                      </span>
                    )}
                    {(data as HigherStudy).studyType && (
                      <Badge variant="secondary" className="px-3 py-1.5">
                        {(data as HigherStudy).studyType?.replace("_", " ")}
                      </Badge>
                    )}
                    {(data as HigherStudy).fieldOfStudy && (
                      <Badge variant="outline" className="px-3 py-1.5">
                        {(data as HigherStudy).fieldOfStudy}
                      </Badge>
                    )}
                  </div>
                  {(data as HigherStudy).applicationDeadline && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Deadline: {new Date((data as HigherStudy).applicationDeadline!).toLocaleDateString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Stats footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  👁️ {mockData.views} views
                </span>
                <span className="flex items-center gap-1">
                  💬 {Math.floor(mockData.views / 10)} comments
                </span>
                <span className="flex items-center gap-1">
                  ❤️ {Math.floor(mockData.views / 20)} likes
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {(type === "jobs" && (data as Job).externalUrl) && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                    <a href={(data as Job).externalUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Apply Now
                    </a>
                  </Button>
                )}
                {(type === "competitions" && (data as Competition).externalUrl) && (
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" asChild>
                    <a href={(data as Competition).externalUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Register
                    </a>
                  </Button>
                )}
                {(type === "higher-studies" && (data as HigherStudy).applicationUrl) && (
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" asChild>
                    <a href={(data as HigherStudy).applicationUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Apply
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-xs">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const filteredAnnouncements = getAllAnnouncements();

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">InsightFeed</h1>
            <p className="text-sm text-muted-foreground">Latest announcements, opportunities, and updates</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(value: AnnouncementType) => setTypeFilter(value)}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="jobs">Jobs</SelectItem>
                <SelectItem value="competitions">Competitions</SelectItem>
                <SelectItem value="achievements">Achievements</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="higher-studies">Higher Studies</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 p-6 border border-border rounded-lg">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
            <p className="text-muted-foreground">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "Check back later for new announcements and opportunities."}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredAnnouncements.map(renderAnnouncementCard)}
          </div>
        )}

        {/* Stats */}
        {!loading && filteredAnnouncements.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}
            {(searchTerm || typeFilter !== "all" || statusFilter !== "all") && (
              <span> matching your filters</span>
            )}
        </div>
        )}
      </div>
    </div>
  );
}
