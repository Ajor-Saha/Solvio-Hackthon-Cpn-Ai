"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  ExternalLink,
  Award,
  BookOpen,
  Trophy,
  Briefcase,
  GraduationCap,
  Share2,
  Heart,
  MessageCircle,
  Eye
} from "lucide-react";

interface MockDetailData {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  skills?: string[];
  benefits?: string[];
  requirements?: string[];
  additionalInfo?: string;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { type, id } = params;

  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState<any>(null);

  // Mock enhanced data for visual appeal
  const mockData: MockDetailData = {
    views: Math.floor(Math.random() * 1000) + 100,
    likes: Math.floor(Math.random() * 200) + 20,
    comments: Math.floor(Math.random() * 50) + 5,
    shares: Math.floor(Math.random() * 30) + 3,
    skills: type === "jobs" ? ["React", "Node.js", "TypeScript", "AWS", "Docker"] :
           type === "competitions" ? ["Problem Solving", "Algorithm Design", "Team Work"] :
           ["Research", "Analysis", "Writing", "Presentation"],
    benefits: type === "jobs" ? ["Health Insurance", "Remote Work", "Flexible Hours", "Learning Budget", "Career Growth"] :
             type === "competitions" ? ["Prize Money", "Certificate", "Networking", "Recognition", "Portfolio Building"] :
             ["Scholarship", "Mentorship", "International Exposure", "Research Opportunities"],
    requirements: type === "jobs" ? ["Bachelor's Degree", "2+ Years Experience", "Strong Communication", "Team Player"] :
                 type === "competitions" ? ["University Student", "Team of 2-4", "Original Ideas", "English Proficiency"] :
                 ["Academic Excellence", "Research Background", "English Proficiency", "Recommendation Letters"],
    additionalInfo: "This is a premium opportunity with excellent growth potential. Join a dynamic team of professionals who are passionate about innovation and excellence."
  };

  useEffect(() => {
    // Simulate API call - in real app this would fetch from backend
    const timer = setTimeout(() => {
      setPostData({
        id,
        type,
        title: `${type === "jobs" ? "Senior Full Stack Developer" :
               type === "competitions" ? "Global Innovation Challenge 2025" :
               type === "achievements" ? "Outstanding Research Excellence Award" :
               type === "research" ? "Advanced AI in Healthcare Research" :
               "PhD in Computer Science - MIT"} (Mock Data)`,
        description: `This is a detailed description for ${type} post. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
        company: type === "jobs" ? "TechCorp Innovation Labs" :
                type === "competitions" ? "Global Tech Foundation" :
                type === "achievements" ? "IEEE Computer Society" :
                type === "research" ? "Stanford Research Institute" :
                "Massachusetts Institute of Technology",
        location: type === "jobs" ? "San Francisco, CA / Remote" :
                 type === "competitions" ? "Virtual Event" :
                 type === "achievements" ? "San Jose, CA" :
                 "Boston, MA",
        salary: type === "jobs" ? "$120k - $180k/year" : null,
        prize: type === "competitions" ? "$50,000 Grand Prize" : null,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: "active"
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [type, id]);

  const getTypeIcon = () => {
    switch (type) {
      case "jobs": return <Briefcase className="w-6 h-6" />;
      case "competitions": return <Trophy className="w-6 h-6" />;
      case "achievements": return <Award className="w-6 h-6" />;
      case "research": return <BookOpen className="w-6 h-6" />;
      case "higher-studies": return <GraduationCap className="w-6 h-6" />;
      default: return <Briefcase className="w-6 h-6" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "jobs": return "from-blue-500 to-cyan-500";
      case "competitions": return "from-yellow-500 to-orange-500";
      case "achievements": return "from-green-500 to-emerald-500";
      case "research": return "from-purple-500 to-pink-500";
      case "higher-studies": return "from-indigo-500 to-blue-500";
      default: return "from-gray-500 to-slate-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          <Badge variant="outline" className="text-sm">
            {type?.toString().replace("-", " ").toUpperCase()}
          </Badge>
        </div>

        {/* Hero Section */}
        <Card className="p-8 mb-8 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${getTypeColor()} opacity-5`}></div>
          <div className="relative">
            <div className="flex items-start gap-6 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getTypeColor()} flex items-center justify-center text-white shadow-lg`}>
                {getTypeIcon()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{postData.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {postData.company}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {postData.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Posted {postData.postedDate}
                  </span>
                </div>

                {/* Salary/Prize Display */}
                {postData.salary && (
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                    💰 {postData.salary}
                  </div>
                )}
                {postData.prize && (
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">
                    🏆 {postData.prize}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {mockData.views} views
              </span>
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {mockData.likes} likes
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {mockData.comments} comments
              </span>
              <span className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                {mockData.shares} shares
              </span>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="leading-relaxed text-muted-foreground mb-4">
                {postData.description}
              </p>
              <p className="leading-relaxed text-muted-foreground">
                {mockData.additionalInfo}
              </p>
            </Card>

            {/* Requirements */}
            {mockData.requirements && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {mockData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Skills/Benefits */}
            {mockData.skills && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {type === "jobs" ? "Required Skills" :
                   type === "competitions" ? "Skills Needed" : "Key Areas"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mockData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    Application Deadline
                  </div>
                  <div className="text-lg font-semibold text-orange-600">
                    {postData.deadline}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {type === "jobs" ? "Apply Now" :
                     type === "competitions" ? "Register" :
                     type === "higher-studies" ? "Apply" : "Learn More"}
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Save for Later
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Post
                  </Button>
                </div>
              </div>
            </Card>

            {/* Benefits */}
            {mockData.benefits && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {type === "jobs" ? "Benefits" :
                   type === "competitions" ? "What You'll Get" : "Benefits"}
                </h3>
                <ul className="space-y-2">
                  {mockData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Company Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Organization</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {postData.company.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{postData.company}</div>
                    <div className="text-sm text-muted-foreground">{postData.location}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Leading organization in technology and innovation with a global presence.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
